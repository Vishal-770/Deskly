import { ipcMain } from "electron";
import { getContactInfo } from "../services/contactInfo.service";

ipcMain.handle("contactInfo:get", async () => {
  return await getContactInfo();
});
