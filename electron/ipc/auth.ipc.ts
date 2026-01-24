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
  setSemesterInfo,
  getSemesterInfo,
  clearSemesterInfo,
} from "../services/storeAuth.service";
import { getSemesters } from "../services/timetable.service";
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
ipcMain.handle("auth:setSemester", (event, data) => setSemesterInfo(data));
ipcMain.handle("auth:getSemester", () => getSemesterInfo());
ipcMain.handle("auth:clearSemester", () => clearSemesterInfo());
ipcMain.handle("auth:getSemesters", () => getSemesters());
