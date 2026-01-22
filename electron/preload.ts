import { contextBridge, ipcRenderer } from "electron";
import type { SystemStats, CGPAData } from "../types/electron/system.types";

contextBridge.exposeInMainWorld("electron", {
  windowControls: {
    minimize: () => ipcRenderer.send("window-minimize"),
    maximize: () => ipcRenderer.send("window-maximize"),
    close: () => ipcRenderer.send("window-close"),
  },
});
contextBridge.exposeInMainWorld("system", {
  getStats: (): Promise<SystemStats> => ipcRenderer.invoke("system:stats"),

  login: (body: {
    username: string;
    password: string;
  }): Promise<{
    success: boolean;
    message?: string;
    error?: string;
    cookies?: string;
    csrf?: string;
    authorizedID?: string;
  }> => ipcRenderer.invoke("login:authenticate", body),

  getContent: (
    cookies: string,
    authorizedID?: string,
    csrf?: string,
  ): Promise<{
    success: boolean;
    courses?: Array<{
      index: number;
      code: string;
      name: string;
      type: string;
      attendance: number;
      remark: string;
    }>;
    semester?: string;
    error?: string;
  }> => ipcRenderer.invoke("content:fetch", cookies, authorizedID, csrf),

  getCGPA: (
    cookies: string,
    authorizedID?: string,
    csrf?: string,
  ): Promise<{
    success: boolean;
    cgpaData?: CGPAData;
    error?: string;
  }> => ipcRenderer.invoke("content:cgpa", cookies, authorizedID, csrf),

  onCpuUpdate: (callback: (cpu: number) => void) => {
    ipcRenderer.on("cpu:update", (_, cpu) => callback(cpu));
  },
});

contextBridge.exposeInMainWorld("auth", {
  login: (data: { userId: string; password: string }): Promise<boolean> =>
    ipcRenderer.invoke("auth:login", data),
  autoLogin: (): Promise<{ userId: string } | null> =>
    ipcRenderer.invoke("auth:autoLogin"),
  logout: (): Promise<boolean> => ipcRenderer.invoke("auth:logout"),
  get: (): Promise<{ userId: string } | null> => ipcRenderer.invoke("auth:get"),
});
