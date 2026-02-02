import { ipcMain } from "electron";
import { getFeedbackStatus } from "../services/FeedbackStaus.service";

ipcMain.handle("feedback:getStatus", async () => {
  return await getFeedbackStatus();
});
