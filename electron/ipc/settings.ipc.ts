import { ipcMain } from "electron";
import { settingsService } from "../services/Settings.service";

ipcMain.handle("settings:getMessType", async () => {
  return settingsService.getMessType();
});

ipcMain.handle("settings:setMessType", async (event, messType: string) => {
  settingsService.setMessType(messType);
  return { success: true };
});

ipcMain.handle("settings:getLaundryBlock", async () => {
  return settingsService.getLaundryBlock();
});

ipcMain.handle("settings:setLaundryBlock", async (event, block: string) => {
  settingsService.setLaundryBlock(block);
  return { success: true };
});

ipcMain.handle("settings:getAll", async () => {
  return settingsService.getAllSettings();
});

ipcMain.handle("settings:clearAll", async () => {
  settingsService.clearAllSettings();
  return { success: true };
});
