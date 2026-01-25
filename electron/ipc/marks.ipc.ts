import { ipcMain } from "electron";
import { getStudentMarkView } from "../services/marks.service";

ipcMain.handle(
  "marks:getStudentMarkView",
  async (event, semesterSubId: string) => {
    return await getStudentMarkView(semesterSubId);
  },
);
