import {
  getCurrentSemesterCourses,
  getCurrentSemesterTimeTable,
  getSemesters,
} from "../services/timetable.service";
import { ipcMain } from "electron";

ipcMain.handle("timetable:get", () => getSemesters());
ipcMain.handle("timetable:courses", () => getCurrentSemesterCourses());
ipcMain.handle("timetable:currentSemester", () =>
  getCurrentSemesterTimeTable(),
);
