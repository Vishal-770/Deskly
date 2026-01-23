import { StudentHistoryData } from "@/lib/electron/parsers/grade.htmlparser";
import { contextBridge, ipcRenderer } from "electron";

type SetAuthTokensPayload = {
  authorizedID: string;
  csrf: string;
  cookies: string;
};

type CGPAData = {
  totalCreditsRequired: number;
  earnedCredits: number;
  currentCGPA: number;
  nonGradedCore: number;
};

type SystemStats = {
  cpu: number;
  memory: {
    used: number;
    total: number;
  };
};

contextBridge.exposeInMainWorld("electron", {
  windowControls: {
    minimize: () => ipcRenderer.send("window-minimize"),
    maximize: () => ipcRenderer.send("window-maximize"),
    close: () => ipcRenderer.send("window-close"),
  },
});

contextBridge.exposeInMainWorld("login", {
  authenticate: (body: {
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
  logout: (body: {
    cookies: string;
    authorizedID: string;
    csrf: string;
  }): Promise<{
    success: boolean;
    error?: string;
  }> => ipcRenderer.invoke("logout:perform", body),
});

contextBridge.exposeInMainWorld("content", {
  fetch: (
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

  cgpa: (
    cookies: string,
    authorizedID?: string,
    csrf?: string,
  ): Promise<{
    success: boolean;
    cgpaData?: CGPAData;
    error?: string;
  }> => ipcRenderer.invoke("content:cgpa", cookies, authorizedID, csrf),
  image: (): Promise<{
    success: boolean;
    image?: string;
    contentType?: string;
    error?: string;
  }> => ipcRenderer.invoke("userImage:fetch"),
});

contextBridge.exposeInMainWorld("profile", {
  get: (
    cookies: string,
    authorizedID: string,
    csrf: string,
  ): Promise<{
    success: boolean;
    data?: any;
    html?: string;
    error?: string;
  }> => ipcRenderer.invoke("profile:get", { cookies, authorizedID, csrf }),
});

contextBridge.exposeInMainWorld("grade", {
  getExamGradeView: (): Promise<{
    success: boolean;
    data?: StudentHistoryData;
    error?: string;
  }> => ipcRenderer.invoke("grade:getExamGradeView"),
});

contextBridge.exposeInMainWorld("system", {
  stats: (): Promise<SystemStats> => ipcRenderer.invoke("system:stats"),

  onCpuUpdate: (callback: (cpu: number) => void) => {
    ipcRenderer.on("cpu:update", (_, cpu) => callback(cpu));
  },
});

contextBridge.exposeInMainWorld("auth", {
  login: (data: { userId: string; password: string }): Promise<boolean> =>
    ipcRenderer.invoke("auth:login", data),
  autoLogin: (): Promise<{
    userId: string;
    loggedIn: boolean;
    lastLogin: number;
  } | null> => ipcRenderer.invoke("auth:autoLogin"),
  logout: (): Promise<boolean> => ipcRenderer.invoke("auth:logout"),
  get: (): Promise<{
    userId: string;
    loggedIn: boolean;
    lastLogin: number;
  } | null> => ipcRenderer.invoke("auth:get"),
  setTokens: (data: SetAuthTokensPayload): Promise<boolean> =>
    ipcRenderer.invoke("auth:setTokens", data),
  getTokens: (): Promise<{
    authorizedID: string;
    csrf: string;
    cookies: string;
  } | null> => ipcRenderer.invoke("auth:getTokens"),
  deleteTokens: (): Promise<boolean> => ipcRenderer.invoke("auth:deleteTokens"),
});
