import { ipcMain } from "electron";
import {
  getAcademicCalendarService,
  getCalendarViewService,
} from "../services/AcademicCallender.service";

ipcMain.handle("academicCalendar:get", async () => {
  console.log("IPC handler academicCalendar:get called");
  const result = await getAcademicCalendarService();
  console.log(
    "IPC handler returning result:",
    result.success ? "success" : "error",
  );
  return result;
});

ipcMain.handle("academicCalendar:getView", async (_, calDate: string) => {
  console.log(
    "IPC handler academicCalendar:getView called with calDate:",
    calDate,
  );
  const result = await getCalendarViewService(calDate);
  console.log(
    "IPC handler returning result:",
    result.success ? "success" : "error",
  );
  return result;
});
