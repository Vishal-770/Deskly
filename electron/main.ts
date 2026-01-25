import { app, protocol, net } from "electron";
import * as path from "path";
import * as fs from "fs";
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

function registerRendererProtocol() {
  // Locate the exported Next.js output in packaged builds
  const outDirCandidates = [
    path.join(process.resourcesPath, "app.asar.unpacked", "out"),
    path.join(app.getAppPath(), "out"),
    path.join(process.resourcesPath, "out"),
    path.join(__dirname, "../out"),
  ];

  console.log("[Protocol] Searching for 'out' directory in:", outDirCandidates);

  const outDir = outDirCandidates.find((candidate) => {
    const exists = fs.existsSync(candidate);
    console.log(
      `[Protocol] Checking ${candidate}: ${exists ? "FOUND" : "not found"}`,
    );
    return exists;
  });

  if (!outDir) {
    console.error(
      "[Protocol] ERROR: Exported renderer 'out' directory not found in any location!",
    );
    return false;
  }

  console.log(`[Protocol] Using output directory: ${outDir}`);

  // Use modern protocol.handle() API (replaces deprecated registerFileProtocol)
  protocol.handle("app", (request) => {
    try {
      const url = new URL(request.url);
      const requestedPath = decodeURIComponent(url.pathname || "/");
      const stripped = requestedPath.replace(/^\/+/, "");

      let finalPath = path.join(outDir, stripped);

      // If the path has no extension, assume a directory and append index.html
      if (!path.extname(finalPath)) {
        finalPath = path.join(finalPath, "index.html");
      }

      // Fallback to root index if the requested file does not exist
      if (!fs.existsSync(finalPath)) {
        console.log(
          `[Protocol] File not found: ${finalPath}, falling back to index.html`,
        );
        finalPath = path.join(outDir, "index.html");
      }

      console.log(`[Protocol] Serving: ${request.url} -> ${finalPath}`);

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

  console.log(
    "[Protocol] Successfully registered app:// protocol with modern API",
  );
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

  // Auto-updater logic removed
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
