import { ipcMain } from "electron";
import { getAttendanceDetail } from "../services/AttendanceDetail.service";

ipcMain.handle(
  "get-attendance-detail",
  async (event, classId: string, slotName: string) => {
    return await getAttendanceDetail(classId, slotName);
  },
);
