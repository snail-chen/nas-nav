# NAS Portal (NAS 导航页)

A modern, futuristic, and secure navigation dashboard for your NAS services.
Built with React, Tailwind CSS, Framer Motion, and Node.js.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Docker](https://img.shields.io/badge/docker-ready-green.svg)

## ✨ Features

- **🎨 Futuristic UI**: Glassmorphism design, dynamic particle background, and fluid animations.
- **🛡️ Secure Access**:
  - User authentication with role-based access control (Admin/User).
  - **IP Logging**: Tracks login IP addresses.
  - **Concurrent Login Prevention**: Prevents account sharing/collision (configurable).
  - **Session Management**: Admins can view online users and kick sessions.
- **🖥️ System Monitor**: Real-time system status dashboard (simulated for now).
- **⚙️ Easy Configuration**:
  - Web-based management for users and service links.
  - Data persistence via JSON files (easy to backup).
- **🐳 Docker Ready**: Full-stack containerization for easy deployment.

## 🚀 Getting Started

### Method 1: Docker Compose (Recommended)

1.  Ensure you have Docker and Docker Compose installed.
2.  Clone this repository.
3.  Run the following command in the project root:

    ```bash
    docker-compose up -d
    ```

4.  Access the dashboard at `http://localhost:3000`.

**Data Persistence**:
- User data and configuration are stored in the `./data` directory on your host machine (mapped to `/app/server/data` in the container).

### Method 2: Manual Installation

1.  **Install Dependencies**:
    ```bash
    # Install root dependencies (concurrently, etc.)
    npm install

    # Install server dependencies
    cd server && npm install && cd ..
    ```

2.  **Run Development Server**:
    ```bash
    npm run dev
    ```
    This will start both the backend (port 3000) and frontend (port 5173) concurrently.

3.  **Build for Production**:
    ```bash
    npm run build
    npm run server
    ```

## 🔑 Default Credentials

- **Username**: `admin`
- **Password**: `admin`

> **Important**: Please change the default password immediately after the first login!

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Framer Motion, Lucide React
- **Backend**: Node.js, Express
- **Deployment**: Docker, Docker Compose

## 📝 License

MIT License
