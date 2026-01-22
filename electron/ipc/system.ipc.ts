import { ipcMain } from "electron";
import { getSystemStats } from "../services/system.service";

ipcMain.handle("system:stats", async () => {
  return await getSystemStats();
});
