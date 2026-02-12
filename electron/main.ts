import { app, protocol, net, dialog } from "electron";
import { autoUpdater } from "electron-updater";
import log from "electron-log";
import * as path from "path";
import * as fs from "fs";

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
import "./ipc/marks.ipc";
import "./ipc/feedback.ipc";
import "./ipc/curriculum.ipc";
import "./ipc/contactInfo.ipc";
import "./ipc/attendanceDetail.ipc";
import "./ipc/academicCalendar.ipc";
import "./ipc/updater.ipc";

import "./ipc/laundary.ipc";
import "./ipc/mess.ipc";
import "./ipc/settings.ipc";
import "./ipc/network.ipc";
import "./ipc/paymentReceipts.ipc";

/*******
 * NETWORK FUNCTIONS
 *
 */

export function checkInternet(): Promise<boolean> {
  return new Promise((resolve) => {
    const request = net.request("https://www.google.com");

    request.on("response", () => resolve(true));
    request.on("error", () => resolve(false));

    request.end();
  });
}

/*******
 * END NETWORK FUNCTIONS
 *
 */

import { initWindow, mainWindow } from "./windows/mainWindow";
import { initUpdaterIPC } from "./ipc/updater.ipc";

const isDev = process.env.NODE_ENV === "development";

function registerRendererProtocol() {
  // Locate the exported Next.js output in packaged builds
  const outDirCandidates = [
    path.join(process.resourcesPath, "app.asar.unpacked", "out"),
    path.join(app.getAppPath(), "out"),
    path.join(process.resourcesPath, "out"),
    path.join(__dirname, "../out"),
  ];

  const outDir = outDirCandidates.find((candidate) => {
    const exists = fs.existsSync(candidate);
    return exists;
  });

  if (!outDir) {
    console.error(
      "[Protocol] ERROR: Exported renderer 'out' directory not found in any location!",
    );
    return false;
  }

  // Use modern protocol.handle() API (replaces deprecated registerFileProtocol)
  protocol.handle("app", (request) => {
    try {
      const url = new URL(request.url);
      const requestedPath = decodeURIComponent(url.pathname || "/");
      const stripped = requestedPath.replace(/^\/+/, "");

      let finalPath = path.join(outDir, stripped);

      const hasExtension = path.extname(finalPath);

      // If the path has no extension, assume a directory and append index.html
      if (!hasExtension) {
        finalPath = path.join(finalPath, "index.html");
      }

      // Check if file exists
      if (!fs.existsSync(finalPath)) {
        if (hasExtension) {
          // For assets (JS, CSS, etc.), return 404 if not found
          return new Response("Asset not found", {
            status: 404,
            headers: { "content-type": "text/plain" },
          });
        } else {
          // For routes, fallback to root index.html
          finalPath = path.join(outDir, "index.html");
        }
      }

      // Return file using net.fetch with file:// URL
      return net.fetch(`file://${finalPath}`);
    } catch (error) {
      console.error("[Protocol] Error handling request:", error);
      return new Response("Failed to load resource", {
        status: 500,
        headers: { "content-type": "text/plain" },
      });
    }
  });

  return true;
}

// Register protocol BEFORE app is ready (critical for production)
if (!isDev) {
  protocol.registerSchemesAsPrivileged([
    {
      scheme: "app",
      privileges: {
        standard: true,
        secure: true,
        supportFetchAPI: true,
        corsEnabled: true,
      },
    },
  ]);
}

app.whenReady().then(() => {
  if (!isDev) {
    const registered = registerRendererProtocol();
    if (!registered) {
      console.error(
        "[Main] Failed to register protocol. App may not work correctly.",
      );
    }
  }

  initWindow();

  // Initialize event IPC

  // Initialize updater IPC (handlers are always available, but actual updates only in packaged apps)
  initUpdaterIPC();

  // Auto-updater: check for updates in production (packaged) only
  if (app.isPackaged) {
    // Configure logging
    log.transports.file.level = "info";
    autoUpdater.logger = log;

    // Configure autoUpdater
    autoUpdater.autoDownload = false;
    autoUpdater.autoInstallOnAppQuit = false;

    // Auto-updater event handlers
    autoUpdater.on("checking-for-update", () => {
      // Send to renderer if window exists
      if (mainWindow) {
        mainWindow.webContents.send("updater:checking");
      }
    });

    autoUpdater.on("update-available", (info) => {
      if (mainWindow) {
        mainWindow.webContents.send("updater:available", info);
      }
    });

    autoUpdater.on("update-not-available", (info) => {
      if (mainWindow) {
        mainWindow.webContents.send("updater:not-available");
      }
    });

    autoUpdater.on("error", (err) => {
      console.error("Update error:", err);
      if (mainWindow) {
        mainWindow.webContents.send("updater:error", err.message);
      }
    });

    autoUpdater.on("download-progress", (progressObj) => {
      if (mainWindow) {
        mainWindow.webContents.send("updater:progress", progressObj);
      }
    });

    autoUpdater.on("update-downloaded", (info) => {
      if (mainWindow) {
        mainWindow.webContents.send("updater:downloaded", info);

        // Show dialog asking user to restart
        const result = dialog.showMessageBoxSync(mainWindow, {
          type: "info",
          title: "Update Ready",
          message:
            "A new version has been downloaded. Restart the application to apply the update.",
          buttons: ["Restart", "Later"],
        });
        if (result === 0) {
          autoUpdater.quitAndInstall();
        }
      }
    });

    // Check for updates on app start (with delay to ensure window is ready)
    setTimeout(() => {
      autoUpdater.checkForUpdates();
    }, 3000);
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
