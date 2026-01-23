import { app, BrowserWindow, ipcMain, globalShortcut } from "electron";
import * as path from "path";
import * as url from "url";
import * as fs from "fs";

const isDev = process.env.NODE_ENV === "development";

export let mainWindow: BrowserWindow | null = null;

export function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minHeight: 400,
    minWidth: 600,
    frame: false,

    icon: path.join(__dirname, "../app/favicon.ico"),
    webPreferences: {
      preload: path.join(__dirname, "../preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
      zoomFactor: 1.0,
    },
  });

  // Set CSP for security
  mainWindow.webContents.session.webRequest.onHeadersReceived(
    (details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          "Content-Security-Policy":
            "default-src 'self' 'unsafe-inline' 'unsafe-eval' file: data:;",
        },
      });
    },
  );

  // Disable zoom
  mainWindow.webContents.setZoomFactor(1);
  mainWindow.webContents.setVisualZoomLevelLimits(1, 1);
  mainWindow.webContents.on("zoom-changed", (event, zoomDirection) => {
    mainWindow?.webContents.setZoomFactor(1);
  });

  if (isDev) {
    mainWindow.loadURL("http://localhost:3000");
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load from the out directory
    const indexPath = path.join(__dirname, "../out/index.html");

    // Check if the file exists
    if (fs.existsSync(indexPath)) {
      mainWindow.loadURL(
        url.format({
          pathname: indexPath,
          protocol: "file:",
          slashes: true,
        }),
      );
    } else {
      console.error("index.html not found at:", indexPath);
    }
  }

  // Handle navigation errors
  mainWindow.webContents.on(
    "did-fail-load",
    (event, errorCode, errorDescription) => {
      console.error("Failed to load:", errorCode, errorDescription);
    },
  );
}

// IPC handlers for window controls
export function setupWindowControls() {
  ipcMain.on("window-minimize", () => {
    if (mainWindow) mainWindow.minimize();
  });

  ipcMain.on("window-maximize", () => {
    if (mainWindow) {
      if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
      } else {
        mainWindow.maximize();
      }
    }
  });

  ipcMain.on("window-close", () => {
    if (mainWindow) mainWindow.close();
  });
}

export function initWindow() {
  createWindow();
  setupWindowControls();

  // Disable zoom shortcuts
  globalShortcut.register("CommandOrControl+=", () => {});
  globalShortcut.register("CommandOrControl+Shift+=", () => {});
  globalShortcut.register("CommandOrControl+-", () => {});
  globalShortcut.register("CommandOrControl+0", () => {});
  globalShortcut.register("CommandOrControl+numadd", () => {});
  globalShortcut.register("CommandOrControl+numsub", () => {});
  globalShortcut.register("CommandOrControl+num0", () => {});
}
