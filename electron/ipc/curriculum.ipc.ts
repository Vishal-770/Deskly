import { ipcMain, dialog } from "electron";
import * as fs from "fs";
import {
  getCurriculum,
  getCurriculumCategoryView,
  downloadCourseSyllabus,
} from "../services/Curriculum.service";

ipcMain.handle("curriculum:get", async () => {
  return await getCurriculum();
});

ipcMain.handle("curriculum:getCategoryView", async (event, args) => {
  const { categoryId } = args;
  const result = await getCurriculumCategoryView(categoryId);
  return result;
});

ipcMain.handle("curriculum:downloadSyllabus", async (event, args) => {
  const { courseCode } = args;

  try {
    const downloadResult = await downloadCourseSyllabus(courseCode);

    if (!downloadResult.success) {
      return downloadResult;
    }

    if (!downloadResult.data) {
      return {
        success: false,
        error: "No data received",
      };
    }

    // Show save dialog
    const result = (await dialog.showSaveDialog({
      title: "Save Course Syllabus",
      defaultPath: downloadResult.filename,
      filters: [
        {
          name: "ZIP Files",
          extensions: ["zip"],
        },
        {
          name: "All Files",
          extensions: ["*"],
        },
      ],
    })) as unknown as Electron.SaveDialogReturnValue;

    if (result.canceled) {
      return {
        success: false,
        error: "Save cancelled by user",
      };
    }

    // Write file
    fs.writeFileSync(
      result.filePath,
      Buffer.from(downloadResult.data as ArrayBuffer),
    );

    return {
      success: true,
      message: `Syllabus saved to ${result.filePath}`,
    };
  } catch (err: unknown) {
    console.error("Error downloading syllabus:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
});
