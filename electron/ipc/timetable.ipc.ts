import { getSemesters } from "../services/timetable.service";
import { ipcMain } from "electron";

ipcMain.handle("timetable:get", () => getSemesters());
