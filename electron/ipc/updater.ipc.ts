import { ipcMain, dialog, app } from "electron";
import { autoUpdater } from "electron-updater";
import log from "electron-log";
import type { UpdateInfo } from "builder-util-runtime";

interface UpdateCheckResult {
  success: boolean;
  updateInfo?: UpdateInfo;
  error?: string;
}

interface DownloadResult {
  success: boolean;
  error?: string;
}

export function initUpdaterIPC() {
  // Check for updates
  ipcMain.handle("updater:check", async (): Promise<UpdateCheckResult> => {
    if (!app.isPackaged) {
      return {
        success: false,
        error: "Updates are only available in packaged builds",
      };
    }
    try {
      const result = await autoUpdater.checkForUpdates();
      if (!result) {
        return { success: false, error: "No update information received" };
      }
      return { success: true, updateInfo: result.updateInfo };
    } catch (error) {
      log.error("Update check failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  });

  // Download and install update
  ipcMain.handle("updater:download", async (): Promise<DownloadResult> => {
    if (!app.isPackaged) {
      return {
        success: false,
        error: "Updates are only available in packaged builds",
      };
    }
    try {
      await autoUpdater.downloadUpdate();
      return { success: true };
    } catch (error) {
      log.error("Update download failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  });

  // Quit and install
  ipcMain.handle("updater:install", () => {
    if (!app.isPackaged) {
      return;
    }
    autoUpdater.quitAndInstall();
  });
}
