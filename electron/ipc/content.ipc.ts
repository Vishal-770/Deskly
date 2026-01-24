import { ipcMain } from "electron";
import { getContentPage, getCGPAPage } from "../services/content.service";

ipcMain.handle("content:fetch", () => getContentPage());
ipcMain.handle("content:cgpa", () => getCGPAPage());
