import { ipcMain } from "electron";
import { checkInternet } from "../main";

ipcMain.handle("check-internet", async () => {
  return await checkInternet();
});
