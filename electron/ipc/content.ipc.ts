import { ipcMain } from "electron";
import { getContentPage, getCGPAPage } from "../services/other/Content.service";

ipcMain.handle("content:fetch", () => getContentPage());
ipcMain.handle("content:cgpa", () => getCGPAPage());
