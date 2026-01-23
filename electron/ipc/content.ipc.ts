import { ipcMain } from "electron";
import { getContentPage, getCGPAPage } from "../services/content.service";
import { getAuthTokens } from "../services/storeAuth.service";

ipcMain.handle("content:fetch", async () => {
  const { cookies: c, authorizedID: aID, csrf: cToken } = await getAuthTokens();
  if (!c || !aID || !cToken) {
    throw new Error("Authentication tokens are missing");
  }
  return await getContentPage(c, aID, cToken);
});

ipcMain.handle("content:cgpa", async () => {
  const { cookies: c, authorizedID: aID, csrf: cToken } = await getAuthTokens();
  if (!c || !aID || !cToken) {
    throw new Error("Authentication tokens are missing");
  }
  return await getCGPAPage(c, aID, cToken);
});
