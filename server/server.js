import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');

// Ensure data directory exists
await fs.mkdir(DATA_DIR, { recursive: true });

const USERS_FILE = path.join(DATA_DIR, 'users.json');
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../dist')));

// In-memory session store: { username: { token, ip, lastActive } }
const activeSessions = {};

// Helper: Read/Write JSON
async function readJSON(file, defaultData) {
  try {
    const data = await fs.readFile(file, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    await writeJSON(file, defaultData);
    return defaultData;
  }
}

async function writeJSON(file, data) {
  await fs.writeFile(file, JSON.stringify(data, null, 2));
}

// Default Data
const DEFAULT_ADMIN = {
  username: 'admin',
  password: 'admin',
  role: 'admin',
  createdAt: Date.now(),
};

const DEFAULT_CONFIG = {
  siteTitle: 'My NAS',
  baseUrl: '192.168.1.100',
  sessionTimeout: 30, // Minutes
  links: [
    { id: '1', name: 'Plex', port: '32400', iconUrl: '' },
    { id: '2', name: 'Sonarr', port: '8989', iconUrl: '' },
    { id: '3', name: 'Radarr', port: '7878', iconUrl: '' },
    { id: '4', name: 'Transmission', port: '9091', iconUrl: '' },
    { id: '5', name: 'Home Assistant', port: '8123', iconUrl: '' },
  ]
};

// --- API Routes ---

// Login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const users = await readJSON(USERS_FILE, [DEFAULT_ADMIN]);
  const config = await readJSON(CONFIG_FILE, DEFAULT_CONFIG);
  
  const user = users.find(u => u.username === username && u.password === password);

  if (!user) {
    return res.status(401).json({ message: '用户名或密码错误' });
  }

  // Risk Control: Check Concurrent Login
  // Exempt Admin and Whitelisted Users
  const isExempt = user.role === 'admin' || user.allowConcurrent;
  const sessionTimeoutMs = (config.sessionTimeout || 30) * 60 * 1000;

  if (!isExempt && activeSessions[username]) {
    const session = activeSessions[username];
    // Check if session is expired
    if (Date.now() - session.lastActive < sessionTimeoutMs) {
        // Still active
        // If IP is different, BLOCK
        if (session.ip !== ip) {
            return res.status(403).json({ 
                message: `该账号已在 IP ${session.ip} 登录。为确保安全，禁止多设备同时登录。`,
                code: 'CONCURRENT_LOGIN_DETECTED'
            });
        }
    }
  }

  // Create Session
  const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
  activeSessions[username] = {
    token,
    ip,
    lastActive: Date.now()
  };

  res.json({ 
    success: true, 
    user: { username: user.username, role: user.role }, 
    token 
  });
});

// Logout
app.post('/api/logout', (req, res) => {
  const { username } = req.body;
  if (username && activeSessions[username]) {
    delete activeSessions[username];
  }
  res.json({ success: true });
});

// Heartbeat / Verify Token
app.get('/api/verify', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    const username = Object.keys(activeSessions).find(u => activeSessions[u].token === token);
    
    if (username) {
        activeSessions[username].lastActive = Date.now();
        res.json({ valid: true, username });
    } else {
        res.status(401).json({ valid: false });
    }
});

// Get Config
app.get('/api/config', async (req, res) => {
  const config = await readJSON(CONFIG_FILE, DEFAULT_CONFIG);
  res.json(config);
});

// Update Config (Admin Only - Simplified check)
app.post('/api/config', async (req, res) => {
  const newConfig = req.body;
  await writeJSON(CONFIG_FILE, newConfig);
  res.json({ success: true });
});

// Get Users (Admin Only)
app.get('/api/users', async (req, res) => {
    const users = await readJSON(USERS_FILE, [DEFAULT_ADMIN]);
    // Return users without passwords, add online status
    const safeUsers = users.map(u => ({ 
        username: u.username, 
        role: u.role, 
        allowConcurrent: u.allowConcurrent || false,
        createdAt: u.createdAt,
        isOnline: !!activeSessions[u.username]
    }));
    res.json(safeUsers);
});

// Add User
app.post('/api/users', async (req, res) => {
    const { username, password, role, allowConcurrent } = req.body;
    const users = await readJSON(USERS_FILE, [DEFAULT_ADMIN]);
    
    if (users.find(u => u.username === username)) {
        return res.status(400).json({ message: 'User exists' });
    }

    users.push({ username, password, role, allowConcurrent: !!allowConcurrent, createdAt: Date.now() });
    await writeJSON(USERS_FILE, users);
    res.json({ success: true });
});

// Toggle User Concurrent Permission (New)
app.post('/api/users/:username/concurrent', async (req, res) => {
    const { username } = req.params;
    const { allowConcurrent } = req.body;
    
    if (username === 'admin') return res.status(400).json({ message: 'Admin settings are fixed' });

    const users = await readJSON(USERS_FILE, [DEFAULT_ADMIN]);
    const userIndex = users.findIndex(u => u.username === username);
    
    if (userIndex === -1) return res.status(404).json({ message: 'User not found' });

    users[userIndex].allowConcurrent = !!allowConcurrent;
    await writeJSON(USERS_FILE, users);
    res.json({ success: true });
});

// Reset User Session (Kick) (New)
app.post('/api/users/:username/reset-session', (req, res) => {
    const { username } = req.params;
    if (activeSessions[username]) {
        delete activeSessions[username];
        res.json({ success: true, message: 'Session reset' });
    } else {
        res.json({ success: false, message: 'User not active' });
    }
});

// Delete User
app.delete('/api/users/:username', async (req, res) => {
    const { username } = req.params;
    if (username === 'admin') return res.status(400).json({ message: 'Cannot delete admin' });

    let users = await readJSON(USERS_FILE, [DEFAULT_ADMIN]);
    users = users.filter(u => u.username !== username);
    await writeJSON(USERS_FILE, users);
    res.json({ success: true });
});

// Change Password
app.post('/api/password', async (req, res) => {
    const { username, newPassword } = req.body;
    const users = await readJSON(USERS_FILE, [DEFAULT_ADMIN]);
    
    const userIndex = users.findIndex(u => u.username === username);
    if (userIndex === -1) return res.status(404).json({ message: 'User not found' });

    users[userIndex].password = newPassword;
    await writeJSON(USERS_FILE, users);
    res.json({ success: true });
});


// Serve React App for any other route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
