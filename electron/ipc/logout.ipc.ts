import { ipcMain } from "electron";
import { logoutUser } from "../services/auth/Logout.service";

ipcMain.handle("logout:perform", async (event, body) => {
  return await logoutUser(body.cookies, body.authorizedID, body.csrf);
});
