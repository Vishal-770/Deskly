import { ipcMain } from "electron";
import { app } from "electron";
import { getSystemStats } from "../services/system.service";

ipcMain.handle("system:stats", async () => {
  return await getSystemStats();
});

ipcMain.handle("system:version", async () => {
  return app.getVersion();
});
