import { ipcMain } from "electron";
import {
  getAcademicCalendarService,
  getCalendarViewService,
} from "../services/AcademicCallender.service";

ipcMain.handle("academicCalendar:get", async () => {
  const result = await getAcademicCalendarService();
  return result;
});

ipcMain.handle("academicCalendar:getView", async (_, calDate: string) => {
  const result = await getCalendarViewService(calDate);
  return result;
});
