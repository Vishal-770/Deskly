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
import * as electron from "electron";
import type { UpdateInfo } from "builder-util-runtime";
import { LaundaryEntry } from "@/types/electron/Laundary.types";
import { FeedbackStatus } from "@/lib/electron/parsers/ParseFeedbackInfo";
import {
  MessMenuResponse,
  MessType,
  MessMenuItem,
} from "@/types/electron/Mess.types";
import { UserSettings } from "./services/system/Settings.service";

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

electron.contextBridge.exposeInMainWorld("electron", {
  windowControls: {
    minimize: () => electron.ipcRenderer.send("window-minimize"),
    maximize: () => electron.ipcRenderer.send("window-maximize"),
    close: () => electron.ipcRenderer.send("window-close"),
  },
});

electron.contextBridge.exposeInMainWorld("attendance", {
  get: (): Promise<{
    success: boolean;
    data?: AttendanceRecord[];
    error?: string;
  }> => electron.ipcRenderer.invoke("timetable:attendance"),
});

electron.contextBridge.exposeInMainWorld("attendanceDetail", {
  get: (
    classId: string,
    slotName: string,
  ): Promise<{
    success: boolean;
    data?: DetailRecord[];
    error?: string;
  }> => electron.ipcRenderer.invoke("get-attendance-detail", classId, slotName),
});

electron.contextBridge.exposeInMainWorld("login", {
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
  }> => electron.ipcRenderer.invoke("login:authenticate", body),
  logout: (body: {
    cookies: string;
    authorizedID: string;
    csrf: string;
  }): Promise<{
    success: boolean;
    error?: string;
  }> => electron.ipcRenderer.invoke("logout:perform", body),
});

electron.contextBridge.exposeInMainWorld("content", {
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
  }> => electron.ipcRenderer.invoke("content:fetch"),

  cgpa: (): Promise<{
    success: boolean;
    cgpaData?: CGPAData;
    error?: string;
  }> => electron.ipcRenderer.invoke("content:cgpa"),
  image: (): Promise<{
    success: boolean;
    image?: string;
    contentType?: string;
    error?: string;
  }> => electron.ipcRenderer.invoke("userImage:fetch"),
});

electron.contextBridge.exposeInMainWorld("profile", {
  get: (
    cookies: string,
    authorizedID: string,
    csrf: string,
  ): Promise<{
    success: boolean;
    data?: ImportantProfileData;
    html?: string;
    error?: string;
  }> =>
    electron.ipcRenderer.invoke("profile:get", { cookies, authorizedID, csrf }),
});

electron.contextBridge.exposeInMainWorld("curriculum", {
  get: (): Promise<{
    success: boolean;
    data?: Category[];
    html?: string;
    error?: string;
  }> => electron.ipcRenderer.invoke("curriculum:get"),
  getCategoryView: (
    categoryId: string,
  ): Promise<{
    success: boolean;
    data?: CourseEntry[];
    html?: string;
    error?: string;
  }> =>
    electron.ipcRenderer.invoke("curriculum:getCategoryView", { categoryId }),
  downloadSyllabus: (
    courseCode: string,
  ): Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }> =>
    electron.ipcRenderer.invoke("curriculum:downloadSyllabus", { courseCode }),
});

electron.contextBridge.exposeInMainWorld("contactInfo", {
  get: (): Promise<ContactInfoResponse> =>
    electron.ipcRenderer.invoke("contactInfo:get"),
});

electron.contextBridge.exposeInMainWorld("academicCalendar", {
  get: (): Promise<{
    success: boolean;
    data?: { label: string; dateValue: string }[];
    error?: string;
  }> => electron.ipcRenderer.invoke("academicCalendar:get"),
  getView: (
    calDate: string,
  ): Promise<{
    success: boolean;
    data?: import("@/lib/electron/parsers/AcademicCalendar.parser").MonthlySchedule;
    error?: string;
  }> => electron.ipcRenderer.invoke("academicCalendar:getView", calDate),
});

electron.contextBridge.exposeInMainWorld("grade", {
  getExamGradeView: (): Promise<{
    success: boolean;
    data?: StudentHistoryData;
    error?: string;
  }> => electron.ipcRenderer.invoke("grade:getExamGradeView"),
});

electron.contextBridge.exposeInMainWorld("marks", {
  getStudentMarkView: (
    semesterSubId: string,
  ): Promise<{
    success: boolean;
    data?: StudentMarkEntry[];
    error?: string;
  }> => electron.ipcRenderer.invoke("marks:getStudentMarkView", semesterSubId),
});

electron.contextBridge.exposeInMainWorld("feedback", {
  getStatus: (): Promise<{
    success: boolean;
    data?: FeedbackStatus[];
    error?: string;
  }> => electron.ipcRenderer.invoke("feedback:getStatus"),
});

electron.contextBridge.exposeInMainWorld("system", {
  stats: (): Promise<SystemStats> =>
    electron.ipcRenderer.invoke("system:stats"),
  version: (): Promise<string> => electron.ipcRenderer.invoke("system:version"),
  openExternal: (url: string): Promise<void> =>
    electron.ipcRenderer.invoke("system:open-external", url),

  onCpuUpdate: (callback: (cpu: number) => void) => {
    electron.ipcRenderer.on("cpu:update", (_, cpu) => callback(cpu));
  },
});

electron.contextBridge.exposeInMainWorld("auth", {
  login: (data: { userId: string; password: string }): Promise<boolean> =>
    electron.ipcRenderer.invoke("auth:login", data),
  autoLogin: (): Promise<{
    userId: string;
    loggedIn: boolean;
    lastLogin: number;
  } | null> => electron.ipcRenderer.invoke("auth:autoLogin"),
  logout: (): Promise<boolean> => electron.ipcRenderer.invoke("auth:logout"),
  get: (): Promise<{
    userId: string;
    loggedIn: boolean;
    lastLogin: number;
  } | null> => electron.ipcRenderer.invoke("auth:get"),
  setTokens: (data: SetAuthTokensPayload): Promise<boolean> =>
    electron.ipcRenderer.invoke("auth:setTokens", data),
  getTokens: (): Promise<{
    authorizedID: string;
    csrf: string;
    cookies: string;
  } | null> => electron.ipcRenderer.invoke("auth:getTokens"),
  deleteTokens: (): Promise<boolean> =>
    electron.ipcRenderer.invoke("auth:deleteTokens"),
  setSemester: (data: Semester): Promise<boolean> =>
    electron.ipcRenderer.invoke("auth:setSemester", data),
  getSemester: (): Promise<Semester | null> =>
    electron.ipcRenderer.invoke("auth:getSemester"),
  clearSemester: (): Promise<boolean> =>
    electron.ipcRenderer.invoke("auth:clearSemester"),
  getSemesters: (): Promise<{
    success: boolean;
    semesters?: Semester[];
    error?: string;
  }> => electron.ipcRenderer.invoke("auth:getSemesters"),
});

electron.contextBridge.exposeInMainWorld("timetable", {
  courses: (): Promise<{
    success: boolean;
    data?: CourseDetails[];
    error?: string;
  }> => electron.ipcRenderer.invoke("timetable:courses"),
  currentSemester: (): Promise<{
    success: boolean;
    data?: WeeklySchedule;
    error?: string;
  }> => electron.ipcRenderer.invoke("timetable:currentSemester"),
  get: (): Promise<{
    success: boolean;
    semesters?: Semester[];
    error?: string;
  }> => electron.ipcRenderer.invoke("timetable:get"),
});

electron.contextBridge.exposeInMainWorld("updater", {
  checkForUpdates: () => electron.ipcRenderer.invoke("updater:check"),
  downloadUpdate: () => electron.ipcRenderer.invoke("updater:download"),
  installUpdate: () => electron.ipcRenderer.invoke("updater:install"),
  onUpdateChecking: (callback: () => void) =>
    electron.ipcRenderer.on("updater:checking", callback),
  onUpdateAvailable: (callback: (info: UpdateInfo) => void) =>
    electron.ipcRenderer.on("updater:available", (_event, info) =>
      callback(info),
    ),
  onUpdateNotAvailable: (callback: (info: UpdateInfo) => void) =>
    electron.ipcRenderer.on("updater:not-available", (_event, info) =>
      callback(info),
    ),
  onUpdateError: (callback: (error: string) => void) =>
    electron.ipcRenderer.on("updater:error", (_event, error) =>
      callback(error),
    ),
  onDownloadProgress: (callback: (progress: ProgressInfo) => void) =>
    electron.ipcRenderer.on("updater:progress", (_event, progress) =>
      callback(progress),
    ),
  onUpdateDownloaded: (callback: (info: UpdateInfo) => void) =>
    electron.ipcRenderer.on("updater:downloaded", (_event, info) =>
      callback(info),
    ),
});

electron.contextBridge.exposeInMainWorld("laundary", {
  getSchedule: (
    block: string,
  ): Promise<{
    success: boolean;
    data?: LaundaryEntry[];
    error?: string;
  }> => electron.ipcRenderer.invoke("laundary:getSchedule", block),
});

electron.contextBridge.exposeInMainWorld("mess", {
  getMenu: (
    mess: MessType,
  ): Promise<{
    success: boolean;
    data?: MessMenuItem[];
    error?: string;
  }> => electron.ipcRenderer.invoke("mess:getMenu", mess),
});

electron.contextBridge.exposeInMainWorld("settings", {
  getMessType: (): Promise<string> =>
    electron.ipcRenderer.invoke("settings:getMessType"),
  setMessType: (messType: string): Promise<{ success: boolean }> =>
    electron.ipcRenderer.invoke("settings:setMessType", messType),
  getLaundryBlock: (): Promise<string> =>
    electron.ipcRenderer.invoke("settings:getLaundryBlock"),
  setLaundryBlock: (block: string): Promise<{ success: boolean }> =>
    electron.ipcRenderer.invoke("settings:setLaundryBlock", block),
  getAll: (): Promise<UserSettings> =>
    electron.ipcRenderer.invoke("settings:getAll"),
  clearAll: (): Promise<{ success: boolean }> =>
    electron.ipcRenderer.invoke("settings:clearAll"),
});

electron.contextBridge.exposeInMainWorld("network", {
  checkInternet: (): Promise<boolean> =>
    electron.ipcRenderer.invoke("check-internet"),
});
