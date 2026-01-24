import { app, protocol } from "electron";
import * as path from "path";
import { autoUpdater } from "electron-updater";
import { mainWindow } from "./windows/mainWindow";

/*******
 * IPC IMPORTS
 *
 */

import "./ipc/system.ipc";
import "./ipc/login.ipc";
import "./ipc/logout.ipc";
import "./ipc/content.ipc";
import "./ipc/getUserImage.ipc";
import "./ipc/auth.ipc";
import "./ipc/profile.ipc";
import "./ipc/grade.ipc";
import "./ipc/timetable.ipc";

/*******
 * END IPC IMPORTS
 *
 */

import { initWindow } from "./windows/mainWindow";

const isDev = process.env.NODE_ENV === "development";

// Register file protocol for production before app is ready
if (!isDev) {
  app.whenReady().then(() => {
    protocol.registerFileProtocol("file", (request, callback) => {
      const pathname = decodeURI(request.url.replace("file:///", ""));
      callback(pathname);
    });
  });
}

app.whenReady().then(() => {
  initWindow();

  // Auto-updater logic
  if (!isDev) {
    autoUpdater.checkForUpdatesAndNotify();

    autoUpdater.on("checking-for-update", () => {
      mainWindow?.webContents.send("update:checking-for-update");
    });

    autoUpdater.on("update-available", () => {
      mainWindow?.webContents.send("update:update-available");
    });

    autoUpdater.on("update-not-available", () => {
      mainWindow?.webContents.send("update:update-not-available");
    });

    autoUpdater.on("error", (err) => {
      mainWindow?.webContents.send("update:error", err);
    });

    autoUpdater.on("download-progress", (progress) => {
      mainWindow?.webContents.send("update:download-progress", progress);
    });

    autoUpdater.on("update-downloaded", () => {
      mainWindow?.webContents.send("update:update-downloaded");
      autoUpdater.quitAndInstall();
    });
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
