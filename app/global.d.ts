import { SystemStats, CGPAData } from "@/types/electron/system.types";
import {
  Course,
  CoursesResponse,
  WeeklyScheduleResponse,
  AttendanceResponse,
} from "@/types/renderer/Course.types";
import { Semester } from "@/types/electron/Semster.types";
import { StudentHistoryData } from "@/lib/electron/parsers/grade.htmlparser";
import { ParsedStudentData } from "@/lib/electron/parseProfileInfo";
import { AttendanceRecord } from "@/lib/electron/parsers/ParseAttendance";
import { StudentMarkEntry } from "@/types/electron/marks.types";

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
        data?: ParsedStudentData;
        html?: string;
        error?: string;
      }>;
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
    attendance: {
      get: () => Promise<{
        success: boolean;
        data?: AttendanceRecord[];
        error?: string;
      }>;
    };
    system: {
      stats: () => Promise<SystemStats>;
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
  }
}

export {};
