import { SystemStats, CGPAData } from "@/types/electron/system.types";
import type { UpdateInfo } from "builder-util-runtime";
import {
  Course,
  CoursesResponse,
  WeeklyScheduleResponse,
  AttendanceResponse,
} from "@/types/renderer/Course.types";
import { Semester } from "@/types/electron/Semster.types";
import { StudentHistoryData } from "@/lib/electron/parsers/grade.htmlparser";
import { ImportantProfileData } from "@/lib/electron/ParseProfileInfo";
import { AttendanceRecord } from "@/lib/electron/parsers/ParseAttendance";
import { StudentMarkEntry } from "@/types/electron/marks.types";
import { Category } from "@/types/electron/curriculum.types";
import { CourseEntry } from "@/lib/electron/parsers/Curriculum.parser";
import { ContactInfoResponse } from "@/types/electron/contactInfo.types";
import { FeedbackStatus } from "@/lib/electron/parsers/ParseFeedbackInfo";

declare global {
  interface Window {
    electron?: {
      windowControls: {
        minimize: () => void;
        maximize: () => void;
        close: () => void;
      };
    };
    timetable: {
      get: () => Promise<{
        success: boolean;
        semesters?: Semester[];
        error?: string;
      }>;
      courses: () => Promise<CoursesResponse>;
      currentSemester: () => Promise<WeeklyScheduleResponse>;
      attendance: () => Promise<AttendanceResponse>;
    };
    login: {
      authenticate: (body: { username: string; password: string }) => Promise<{
        success: boolean;
        message?: string;
        error?: string;
        cookies?: string;
        csrf?: string;
        authorizedID?: string;
      }>;
      logout: (body: {
        cookies: string;
        authorizedID: string;
        csrf: string;
      }) => Promise<{
        success: boolean;
        error?: string;
      }>;
    };
    content: {
      fetch: () => Promise<{
        success: boolean;
        courses?: Course[];
        semester?: string;
        error?: string;
      }>;
      cgpa: () => Promise<{
        success: boolean;
        cgpaData?: CGPAData;
        error?: string;
      }>;
      image: () => Promise<{
        success: boolean;
        image?: string;
        contentType?: string;
        error?: string;
      }>;
    };
    profile: {
      get: (
        cookies: string,
        authorizedID: string,
        csrf: string,
      ) => Promise<{
        success: boolean;
        data?: ImportantProfileData;
        html?: string;
        error?: string;
      }>;
    };
    curriculum: {
      get: () => Promise<{
        success: boolean;
        data?: Category[];
        html?: string;
        error?: string;
      }>;
      getCategoryView: (categoryId: string) => Promise<{
        success: boolean;
        data?: CourseEntry[];
        html?: string;
        error?: string;
      }>;
      downloadSyllabus: (courseCode: string) => Promise<{
        success: boolean;
        message?: string;
        error?: string;
      }>;
    };
    contactInfo: {
      get: () => Promise<ContactInfoResponse>;
    };
    academicCalendar: {
      get: () => Promise<{
        success: boolean;
        data?: { label: string; dateValue: string }[];
        error?: string;
      }>;
      getView: (calDate: string) => Promise<{
        success: boolean;
        data?: MonthlySchedule;
        error?: string;
      }>;
    };
    laundary: {
      getSchedule: (block: string) => Promise<{
        success: boolean;
        data?: LaundaryEntry[];
        error?: string;
      }>;
    };
    mess: {
      getMenu: (mess: MessType) => Promise<MessMenuResponse>;
    };
    grade: {
      getExamGradeView: () => Promise<{
        success: boolean;
        data?: StudentHistoryData;
        error?: string;
      }>;
    };
    marks: {
      getStudentMarkView: (semesterSubId: string) => Promise<{
        success: boolean;
        data?: StudentMarkEntry[];
        error?: string;
      }>;
    };
    feedback: {
      getStatus: () => Promise<{
        success: boolean;
        data?: FeedbackStatus[];
        error?: string;
      }>;
    };
    attendance: {
      get: () => Promise<{
        success: boolean;
        data?: AttendanceRecord[];
        error?: string;
      }>;
    };
    system: {
      stats: () => Promise<SystemStats>;
      version: () => Promise<string>;
      openExternal: (url: string) => Promise<void>;
      onCpuUpdate: (cb: (cpu: number) => void) => void;
    };
    auth: {
      login: (data: { userId: string; password: string }) => Promise<boolean>;
      autoLogin: () => Promise<{
        userId: string;
        loggedIn: boolean;
        lastLogin: number;
      } | null>;
      logout: () => Promise<boolean>;
      get: () => Promise<{
        userId: string;
        loggedIn: boolean;
        lastLogin: number;
      } | null>;
      setTokens: (data: {
        authorizedID: string;
        csrf: string;
        cookies: string;
      }) => Promise<boolean>;
      getTokens: () => Promise<{
        authorizedID: string;
        csrf: string;
        cookies: string;
      } | null>;
      deleteTokens: () => Promise<boolean>;
      setSemester: (data: Semester) => Promise<boolean>;
      getSemester: () => Promise<Semester | null>;
      clearSemester: () => Promise<boolean>;
      getSemesters: () => Promise<{
        success: boolean;
        semesters?: Semester[];
        error?: string;
      }>;
    };
    eventHub: {
      fetch: () => Promise<{
        success: boolean;
        html?: string;
        error?: string;
      }>;
    };
    settings: {
      getMessType: () => Promise<string | null>;
      setMessType: (messType: string) => Promise<void>;
      getLaundryBlock: () => Promise<string | null>;
      setLaundryBlock: (block: string) => Promise<void>;
    };
    updater: {
      checkForUpdates: () => Promise<{
        success: boolean;
        updateInfo?: UpdateInfo;
        error?: string;
      }>;
      downloadUpdate: () => Promise<{
        success: boolean;
        error?: string;
      }>;
      installUpdate: () => void;
      onUpdateChecking: (callback: () => void) => void;
      onUpdateAvailable: (callback: (info: UpdateInfo) => void) => void;
      onUpdateNotAvailable: (callback: (info: UpdateInfo) => void) => void;
      onUpdateError: (callback: (error: string) => void) => void;
      onDownloadProgress: (
        callback: (progress: {
          bytesPerSecond: number;
          percent: number;
          transferred: number;
          total: number;
        }) => void,
      ) => void;
      onUpdateDownloaded: (callback: (info: UpdateInfo) => void) => void;
    };
    network: {
      checkInternet: () => Promise<boolean>;
    };
  }
}

export {};
