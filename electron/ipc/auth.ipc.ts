import {
  autoLogin,
  clearAuthTokens,
  getAuthState,
  getAuthTokens,
  LoginPayload,
  loginUser,
  logoutUser,
  setAuthTokens,
  SetAuthTokensPayload,
} from "../services/storeAuth.service";
import { ipcMain } from "electron";

ipcMain.handle("auth:login", (event, data: LoginPayload) => loginUser(data));
ipcMain.handle("auth:autoLogin", () => autoLogin());
ipcMain.handle("auth:logout", () => logoutUser());
ipcMain.handle("auth:get", () => getAuthState());
ipcMain.handle("auth:setTokens", (event, data: SetAuthTokensPayload) =>
  setAuthTokens(data),
);
ipcMain.handle("auth:getTokens", () => getAuthTokens());
ipcMain.handle("auth:deleteTokens", () => clearAuthTokens());
