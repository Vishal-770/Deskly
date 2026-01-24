import { StudentHistoryData } from "@/lib/electron/parsers/grade.htmlparser";
import { Semester } from "@/types/electron/Semster.types";
import { contextBridge, ipcRenderer } from "electron";

console.log("Preload script loaded");

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
  timetable: {
    get: () => ipcRenderer.invoke("timetable:get"),
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
  fetch: (): Promise<{
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
  }> => ipcRenderer.invoke("content:fetch"),

  cgpa: (): Promise<{
    success: boolean;
    cgpaData?: CGPAData;
    error?: string;
  }> => ipcRenderer.invoke("content:cgpa"),
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
  setSemester: (data: Semester): Promise<boolean> =>
    ipcRenderer.invoke("auth:setSemester", data),
  getSemester: (): Promise<Semester | null> =>
    ipcRenderer.invoke("auth:getSemester"),
  clearSemester: (): Promise<boolean> =>
    ipcRenderer.invoke("auth:clearSemester"),
  getSemesters: (): Promise<{
    success: boolean;
    semesters?: Semester[];
    error?: string;
  }> => ipcRenderer.invoke("auth:getSemesters"),
});

contextBridge.exposeInMainWorld("update", {
  onCheckingForUpdate: (callback: () => void) => {
    ipcRenderer.on("update:checking-for-update", () => callback());
  },
  onUpdateAvailable: (callback: () => void) => {
    ipcRenderer.on("update:update-available", () => callback());
  },
  onUpdateNotAvailable: (callback: () => void) => {
    ipcRenderer.on("update:update-not-available", () => callback());
  },
  onDownloadProgress: (callback: (progress: { percent: number }) => void) => {
    ipcRenderer.on("update:download-progress", (_, progress) =>
      callback(progress),
    );
  },
  onUpdateDownloaded: (callback: () => void) => {
    ipcRenderer.on("update:update-downloaded", () => callback());
  },
  onError: (callback: (error: Error) => void) => {
    ipcRenderer.on("update:error", (_, error) => callback(error));
  },
});
