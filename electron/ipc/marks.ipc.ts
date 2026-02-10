import { ipcMain } from "electron";
import { getStudentMarkView } from "../services/grades/Marks.service";

ipcMain.handle(
  "marks:getStudentMarkView",
  async (event, semesterSubId: string) => {
    return await getStudentMarkView(semesterSubId);
  },
);
