import { ipcMain } from "electron";
import { getContactInfo } from "../services/profile/ContactInfo.service";

ipcMain.handle("contactInfo:get", async () => {
  return await getContactInfo();
});
