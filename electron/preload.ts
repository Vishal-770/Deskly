import { StudentHistoryData } from "@/lib/electron/parsers/GradeHtmlParser.parser";
import { Semester } from "@/types/electron/Semster.types";
import { AttendanceRecord } from "@/lib/electron/parsers/ParseAttendance";
import { CourseDetails } from "@/types/electron/Course.types";
import { WeeklySchedule } from "@/types/electron/TimeTable.types";
import { StudentMarkEntry } from "@/types/electron/marks.types";
import { ImportantProfileData } from "@/lib/electron/ParseProfileInfo";
import { Category } from "@/types/electron/curriculum.types";
import { CourseEntry } from "@/lib/electron/parsers/Curriculum.parser";
import { ContactInfoResponse } from "@/types/electron/contactInfo.types";
import { AttendanceRecord as DetailRecord } from "@/lib/electron/parsers/ParseAttendanceDetails.parser";
import { contextBridge, ipcRenderer } from "electron";
import type { UpdateInfo } from "builder-util-runtime";
import { LaundaryEntry } from "@/types/electron/Laundary.types";
import { FeedbackStatus } from "@/lib/electron/parsers/ParseFeedbackInfo";
import {
  MessMenuResponse,
  MessType,
  MessMenuItem,
} from "@/types/electron/Mess.types";
import { UserSettings } from "@/electron/services/system/Settings.service";

// Updater types
interface ProgressInfo {
  total: number;
  delta: number;
  transferred: number;
  percent: number;
  bytesPerSecond: number;
}

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

contextBridge.exposeInMainWorld("attendanceDetail", {
  get: (
    classId: string,
    slotName: string,
  ): Promise<{
    success: boolean;
    data?: DetailRecord[];
    error?: string;
  }> => ipcRenderer.invoke("get-attendance-detail", classId, slotName),
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
    data?: ImportantProfileData;
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

contextBridge.exposeInMainWorld("academicCalendar", {
  get: (): Promise<{
    success: boolean;
    data?: { label: string; dateValue: string }[];
    error?: string;
  }> => ipcRenderer.invoke("academicCalendar:get"),
  getView: (
    calDate: string,
  ): Promise<{
    success: boolean;
    data?: import("@/lib/electron/parsers/AcademicCalendar.parser").MonthlySchedule;
    error?: string;
  }> => ipcRenderer.invoke("academicCalendar:getView", calDate),
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

contextBridge.exposeInMainWorld("feedback", {
  getStatus: (): Promise<{
    success: boolean;
    data?: FeedbackStatus[];
    error?: string;
  }> => ipcRenderer.invoke("feedback:getStatus"),
});

contextBridge.exposeInMainWorld("system", {
  stats: (): Promise<SystemStats> => ipcRenderer.invoke("system:stats"),
  version: (): Promise<string> => ipcRenderer.invoke("system:version"),

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

contextBridge.exposeInMainWorld("updater", {
  checkForUpdates: () => ipcRenderer.invoke("updater:check"),
  downloadUpdate: () => ipcRenderer.invoke("updater:download"),
  installUpdate: () => ipcRenderer.invoke("updater:install"),
  onUpdateChecking: (callback: () => void) =>
    ipcRenderer.on("updater:checking", callback),
  onUpdateAvailable: (callback: (info: UpdateInfo) => void) =>
    ipcRenderer.on("updater:available", (_event, info) => callback(info)),
  onUpdateNotAvailable: (callback: (info: UpdateInfo) => void) =>
    ipcRenderer.on("updater:not-available", (_event, info) => callback(info)),
  onUpdateError: (callback: (error: string) => void) =>
    ipcRenderer.on("updater:error", (_event, error) => callback(error)),
  onDownloadProgress: (callback: (progress: ProgressInfo) => void) =>
    ipcRenderer.on("updater:progress", (_event, progress) =>
      callback(progress),
    ),
  onUpdateDownloaded: (callback: (info: UpdateInfo) => void) =>
    ipcRenderer.on("updater:downloaded", (_event, info) => callback(info)),
});

contextBridge.exposeInMainWorld("laundary", {
  getSchedule: (
    block: string,
  ): Promise<{
    success: boolean;
    data?: LaundaryEntry[];
    error?: string;
  }> => ipcRenderer.invoke("laundary:getSchedule", block),
});

contextBridge.exposeInMainWorld("mess", {
  getMenu: (
    mess: MessType,
  ): Promise<{
    success: boolean;
    data?: MessMenuItem[];
    error?: string;
  }> => ipcRenderer.invoke("mess:getMenu", mess),
});

contextBridge.exposeInMainWorld("settings", {
  getMessType: (): Promise<string> =>
    ipcRenderer.invoke("settings:getMessType"),
  setMessType: (messType: string): Promise<{ success: boolean }> =>
    ipcRenderer.invoke("settings:setMessType", messType),
  getLaundryBlock: (): Promise<string> =>
    ipcRenderer.invoke("settings:getLaundryBlock"),
  setLaundryBlock: (block: string): Promise<{ success: boolean }> =>
    ipcRenderer.invoke("settings:setLaundryBlock", block),
  getAll: (): Promise<UserSettings> => ipcRenderer.invoke("settings:getAll"),
  clearAll: (): Promise<{ success: boolean }> =>
    ipcRenderer.invoke("settings:clearAll"),
});

contextBridge.exposeInMainWorld("network", {
  checkInternet: (): Promise<boolean> => ipcRenderer.invoke("check-internet"),
});
