import { ipcMain } from "electron";
import { getContentPage, getCGPAPage } from "../services/content.service";

ipcMain.handle("content:fetch", async (event, cookies, authorizedID, csrf) => {
  return await getContentPage(cookies, authorizedID, csrf);
});

ipcMain.handle("content:cgpa", async (event, cookies, authorizedID, csrf) => {
  return await getCGPAPage(cookies, authorizedID, csrf);
});
