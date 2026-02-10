import { ipcMain } from "electron";
import { getUserImage } from "../services/profile/GetUserImage.service";

ipcMain.handle("userImage:fetch", async () => {
  return await getUserImage();
});
