const { app, BrowserWindow, ipcMain } = require("electron");
const { autoUpdater } = require('electron-updater');
const path = require("path");
function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
        },
        icon: path.join(__dirname, "icon.ico"),
    });

    win.setMenuBarVisibility(false);
    win.loadFile("index.html");

    win.webContents.on("did-finish-load", () => {
        win.webContents.send("request-notification-permission");
    });
}
app.on('ready', () => {
    createWindow();
    autoUpdater.checkForUpdatesAndNotify(); // Tự kiểm tra khi mở app
});
app.whenReady().then(createWindow);

ipcMain.handle("get-app-version", () => {
    return app.getVersion();
});
