import { ipcMain } from "electron";
import { getUserImage } from "../services/getUserImage.service";

ipcMain.handle("userImage:fetch", async () => {
  return await getUserImage();
});
