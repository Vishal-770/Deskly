import { ipcMain } from "electron";
import { getFeedbackStatus } from "../services/other/FeedbackStatus.service";

ipcMain.handle("feedback:getStatus", async () => {
  return await getFeedbackStatus();
});
