import { app, BrowserWindow, ipcMain, globalShortcut } from "electron";
import * as path from "path";

const isDev = process.env.NODE_ENV === "development";

// Disable unused Chromium features for smaller bundle size
app.commandLine.appendSwitch(
  "disable-features",
  "TranslateUI,BlinkGenPropertyTrees",
);

export let mainWindow: BrowserWindow | null = null;

export function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minHeight: 400,
    minWidth: 600,
    frame: false,
    show: false, // Hide until ready-to-show event
    backgroundColor: "#000000", // Prevent white flash

    icon: path.join(app.getAppPath(), "public/app-logo.png"),
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
            "default-src 'self' 'unsafe-inline' 'unsafe-eval' file: data: app:;",
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

  // Show window only when content is ready
  mainWindow.once("ready-to-show", () => {
    mainWindow?.show();
  });

  // Handle navigation errors
  mainWindow.webContents.on(
    "did-fail-load",
    (event, errorCode, errorDescription, validatedURL) => {
      console.error("[Window] Failed to load:", {
        url: validatedURL,
        errorCode,
        errorDescription,
      });
    },
  );

  // Log when page finishes loading
  mainWindow.webContents.on("did-finish-load", () => {});

  // Log console messages from renderer for debugging
  mainWindow.webContents.on(
    "console-message",
    (_event, _level, _message, _line, _sourceId) => {},
  );

  if (isDev) {
    mainWindow.loadURL("http://localhost:3000");
    mainWindow.webContents.openDevTools();
  } else {
    // Renderer is served via the custom app:// protocol registered in main.ts
    mainWindow.loadURL("app://index.html");
  }
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
