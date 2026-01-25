import { StudentHistoryData } from "@/lib/electron/parsers/grade.htmlparser";
import { Semester } from "@/types/electron/Semster.types";
import { AttendanceRecord } from "@/lib/electron/parsers/ParseAttendance";
import { CourseDetails } from "@/types/electron/Course.types";
import { WeeklySchedule } from "@/types/electron/TimeTable.types";
import { StudentMarkEntry } from "@/types/electron/marks.types";
import { ParsedStudentData } from "@/lib/electron/parseProfileInfo";
import { Category } from "@/types/electron/curriculum.types";
import { CourseEntry } from "@/lib/electron/parsers/Curriculum.parser";
import { ContactInfoResponse } from "@/types/electron/contactInfo.types";
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
});

contextBridge.exposeInMainWorld("attendance", {
  get: (): Promise<{
    success: boolean;
    data?: AttendanceRecord[];
    error?: string;
  }> => ipcRenderer.invoke("timetable:attendance"),
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
    data?: ParsedStudentData;
    html?: string;
    error?: string;
  }> => ipcRenderer.invoke("profile:get", { cookies, authorizedID, csrf }),
});

contextBridge.exposeInMainWorld("curriculum", {
  get: (): Promise<{
    success: boolean;
    data?: Category[];
    html?: string;
    error?: string;
  }> => ipcRenderer.invoke("curriculum:get"),
  getCategoryView: (
    categoryId: string,
  ): Promise<{
    success: boolean;
    data?: CourseEntry[];
    html?: string;
    error?: string;
  }> => ipcRenderer.invoke("curriculum:getCategoryView", { categoryId }),
  downloadSyllabus: (
    courseCode: string,
  ): Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }> => ipcRenderer.invoke("curriculum:downloadSyllabus", { courseCode }),
});

contextBridge.exposeInMainWorld("contactInfo", {
  get: (): Promise<ContactInfoResponse> =>
    ipcRenderer.invoke("contactInfo:get"),
});

contextBridge.exposeInMainWorld("grade", {
  getExamGradeView: (): Promise<{
    success: boolean;
    data?: StudentHistoryData;
    error?: string;
  }> => ipcRenderer.invoke("grade:getExamGradeView"),
});

contextBridge.exposeInMainWorld("marks", {
  getStudentMarkView: (
    semesterSubId: string,
  ): Promise<{
    success: boolean;
    data?: StudentMarkEntry[];
    error?: string;
  }> => ipcRenderer.invoke("marks:getStudentMarkView", semesterSubId),
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

contextBridge.exposeInMainWorld("timetable", {
  courses: (): Promise<{
    success: boolean;
    data?: CourseDetails[];
    error?: string;
  }> => ipcRenderer.invoke("timetable:courses"),
  currentSemester: (): Promise<{
    success: boolean;
    data?: WeeklySchedule;
    error?: string;
  }> => ipcRenderer.invoke("timetable:currentSemester"),
  get: (): Promise<{
    success: boolean;
    semesters?: Semester[];
    error?: string;
  }> => ipcRenderer.invoke("timetable:get"),
});
