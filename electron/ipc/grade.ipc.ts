import { ipcMain } from "electron";
import { getExamGradeView } from "../services/grades/Grade.service";

ipcMain.handle("grade:getExamGradeView", async () => {
  return await getExamGradeView();
});
