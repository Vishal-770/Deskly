import { ipcMain } from "electron";
import { getMessMenu, MessType } from "../services/Mess.service";

ipcMain.handle("mess:getMenu", async (event, mess: MessType) => {
  return await getMessMenu(mess);
});
