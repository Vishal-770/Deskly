import { ipcMain } from "electron";
import { fetchLaundarySchedule } from "../services/Laundary.service";

ipcMain.handle("laundary:getSchedule", async (event, block: string) => {
  try {
    const data = await fetchLaundarySchedule(block);
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
});
