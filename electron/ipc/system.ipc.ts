import { ipcMain } from "electron";
import { app } from "electron";
import { shell } from "electron";
import { getSystemStats } from "../services/system/System.service";

ipcMain.handle("system:stats", async () => {
  return await getSystemStats();
});

ipcMain.handle("system:version", async () => {
  return app.getVersion();
});

ipcMain.handle("system:open-external", async (_, url: string) => {
  await shell.openExternal(url);
});
