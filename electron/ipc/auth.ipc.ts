import {
  autoLogin,
  getAuthState,
  LoginPayload,
  loginUser,
  logoutUser,
} from "../services/storeAuth.service";
import { ipcMain } from "electron";

ipcMain.handle("auth:login", (event, data: LoginPayload) => loginUser(data));
ipcMain.handle("auth:autoLogin", () => autoLogin());
ipcMain.handle("auth:logout", () => logoutUser());
ipcMain.handle("auth:get", () => getAuthState());
