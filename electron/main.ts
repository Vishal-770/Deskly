import { app, protocol } from "electron";
import * as path from "path";

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
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
