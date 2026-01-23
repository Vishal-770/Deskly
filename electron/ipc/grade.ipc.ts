import { ipcMain } from "electron";
import { getExamGradeView } from "../services/grade.service";

ipcMain.handle("grade:getExamGradeView", async () => {
  return await getExamGradeView();
});
