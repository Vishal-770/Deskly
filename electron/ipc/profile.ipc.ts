import { ipcMain } from "electron";
import { getStudentProfile } from "../services/profile.service";

ipcMain.handle("profile:get", async (event, args) => {
  const { cookies, authorizedID, csrf } = args;
  return await getStudentProfile(cookies, authorizedID, csrf);
});
