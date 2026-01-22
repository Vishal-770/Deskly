import { ipcMain } from "electron";
import { loginService } from "../services/login.service";

ipcMain.handle("login:authenticate", async (event, body) => {
  return await loginService(body);
});
