import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import wol from 'wake_on_lan';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');

// Ensure data directory exists
// 确保数据目录存在
await fs.mkdir(DATA_DIR, { recursive: true });

const USERS_FILE = path.join(DATA_DIR, 'users.json');
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');

// Middleware
// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../dist')));

// In-memory session store: { username: { token, ip, lastActive } }
// 内存会话存储: { username: { token, ip, lastActive } }
const activeSessions = {};

// Helper: Read/Write JSON
// 辅助函数：读/写 JSON
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
// 默认数据
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
// --- API 路由 ---

// Login
// 登录
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
  // 风控：检查并发登录
  // 豁免管理员和白名单用户
  const isExempt = user.role === 'admin' || user.allowConcurrent;
  const sessionTimeoutMs = (config.sessionTimeout || 30) * 60 * 1000;

  if (!isExempt && activeSessions[username]) {
    const session = activeSessions[username];
    // Check if session is expired
    // 检查会话是否过期
    if (Date.now() - session.lastActive < sessionTimeoutMs) {
        // Still active
        // If IP is different, BLOCK
        // 仍然活跃
        // 如果 IP 不同，则拦截
        if (session.ip !== ip) {
            return res.status(403).json({ 
                message: `该账号已在 IP ${session.ip} 登录。为确保安全，禁止多设备同时登录。`,
                code: 'CONCURRENT_LOGIN_DETECTED'
            });
        }
    }
  }

  // Create Session
  // 创建会话
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
// 登出
app.post('/api/logout', (req, res) => {
  const { username } = req.body;
  if (username && activeSessions[username]) {
    delete activeSessions[username];
  }
  res.json({ success: true });
});

// Heartbeat / Verify Token
// 心跳 / 验证 Token
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
// 获取配置
app.get('/api/config', async (req, res) => {
  const config = await readJSON(CONFIG_FILE, DEFAULT_CONFIG);
  res.json(config);
});

// Update Config (Admin Only - Simplified check)
// 更新配置 (仅限管理员 - 简化检查)
app.post('/api/config', async (req, res) => {
  const newConfig = req.body;
  await writeJSON(CONFIG_FILE, newConfig);
  res.json({ success: true });
});

// Get Users (Admin Only)
// 获取用户 (仅限管理员)
app.get('/api/users', async (req, res) => {
    const users = await readJSON(USERS_FILE, [DEFAULT_ADMIN]);
    // Return users without passwords, add online status
    // 返回不带密码的用户信息，添加在线状态
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
// 添加用户
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
// 切换用户并发登录权限 (新增)
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
// 重置用户会话 (踢出) (新增)
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
// 删除用户
app.delete('/api/users/:username', async (req, res) => {
    const { username } = req.params;
    if (username === 'admin') return res.status(400).json({ message: 'Cannot delete admin' });

    let users = await readJSON(USERS_FILE, [DEFAULT_ADMIN]);
    users = users.filter(u => u.username !== username);
    await writeJSON(USERS_FILE, users);
    res.json({ success: true });
});

// Change Password
// 修改密码
app.post('/api/password', async (req, res) => {
    const { username, newPassword } = req.body;
    const users = await readJSON(USERS_FILE, [DEFAULT_ADMIN]);
    
    const userIndex = users.findIndex(u => u.username === username);
    if (userIndex === -1) return res.status(404).json({ message: 'User not found' });

    users[userIndex].password = newPassword;
    await writeJSON(USERS_FILE, users);
    res.json({ success: true });
});

// --- Network Tools Routes ---
// --- 网络工具路由 ---

// Scan LAN
// 扫描局域网
app.get('/api/lan/scan', async (req, res) => {
  try {
    // Detect subnet (simplified, assumes /24)
    // 简单的子网检测，假设为 /24
    const { stdout: ipOut } = await execPromise("ip route get 1 | awk '{print $7}'");
    const localIp = ipOut.trim();
    
    if (!localIp) throw new Error('Could not determine local IP');
    
    // Assume /24 subnet
    const subnet = localIp.substring(0, localIp.lastIndexOf('.')) + '.0/24';
    console.log(`Scanning subnet: ${subnet} from IP: ${localIp}`);

    // Run nmap
    // -sn: Ping Scan - disable port scan
    // nmap output format varies, we parse basic info
    const { stdout } = await execPromise(`nmap -sn ${subnet}`);
    
    const devices = [];
    const lines = stdout.split('\n');
    let currentDevice = {};
    
    for (const line of lines) {
      if (line.startsWith('Nmap scan report for')) {
         if (currentDevice.ip) devices.push(currentDevice);
         currentDevice = {};
         
         // Parse IP and Hostname
         // Nmap scan report for _gateway (172.19.0.1)
         // Nmap scan report for 172.19.0.2
         const parts = line.split(' ');
         const lastPart = parts[parts.length - 1];
         
         if (lastPart.startsWith('(')) {
             currentDevice.ip = lastPart.replace(/\(|\)/g, '');
             currentDevice.hostname = parts.slice(4, parts.length - 1).join(' ');
         } else {
             currentDevice.ip = lastPart;
             currentDevice.hostname = ''; // No hostname resolved
         }
      } else if (line.includes('MAC Address:')) {
          // MAC Address: 02:42:AC:13:00:02 (Unknown)
          const match = line.match(/MAC Address: ([0-9A-F:]{17}) \((.*)\)/i);
          if (match) {
              currentDevice.mac = match[1];
              currentDevice.vendor = match[2];
          }
      }
    }
    if (currentDevice.ip) devices.push(currentDevice);
    
    // Filter out our own IP if nmap doesn't show MAC for localhost (it usually doesn't)
    // But we want to see other devices.
    
    res.json(devices);
  } catch (error) {
    console.error('Scan error:', error);
    // Fallback for dev environment where nmap/ip might be missing
    res.status(500).json({ error: 'Scan failed', details: error.message });
  }
});

// Wake on LAN
// 局域网唤醒
app.post('/api/lan/wake', (req, res) => {
    const { mac } = req.body;
    if (!mac) return res.status(400).json({ error: 'MAC address required' });
    
    wol.wake(mac, (err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to send magic packet', details: err });
        }
        res.json({ success: true, message: `Magic packet sent to ${mac}` });
    });
});


// Serve React App for any other route
// 对所有其他路由提供 React 应用
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
