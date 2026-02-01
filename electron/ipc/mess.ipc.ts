import { ipcMain } from "electron";
import { getMessMenu, MessType } from "../services/Mess.service";

ipcMain.handle("mess:getMenu", async (event, mess: MessType) => {
  console.log(`[Mess IPC] Received request for mess type: ${mess}`);
  const result = await getMessMenu(mess);
  console.log(`[Mess IPC] Returning result for ${mess}:`, {
    success: result.success,
    hasData: !!result.data,
    error: result.error,
  });
  return result;
});
