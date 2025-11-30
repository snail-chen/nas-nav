# NAS Portal

A modern, beautiful navigation dashboard for your NAS services with interactive particle effects.

## Features

- 🎨 **Modern Design**: Glassmorphism UI with a responsive grid layout.
- ✨ **Interactive Particles**: Background particles react to your mouse movement.
- ⚙️ **Easy Configuration**: Set your NAS IP/Domain once, and it applies to all services.
- 🔗 **Simple Management**: Add services by just providing a name and port number.
- 💾 **Local Storage**: Your configuration is saved locally in your browser.

## Getting Started

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Run Development Server**:
    ```bash
    npm run dev
    ```

3.  **Build for Production**:
    ```bash
    npm run build
    ```
    The output will be in the `dist` folder, which you can serve with any static web server (Nginx, Apache, etc.).

## Usage

1.  Click the **Settings** icon (gear) in the top right to set your NAS IP address or Domain (e.g., `192.168.1.100` or `mynas.com`).
2.  Click the **Add Service** card to add a new link. Enter the service name (e.g., "Plex") and the port (e.g., "32400").
3.  The link will be automatically generated as `http://<NAS_IP>:<PORT>`.
