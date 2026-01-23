import { SystemStats, CGPAData } from "@/types/electron/system.types";
import { Course } from "@/types/renderer/Course.types";

declare global {
  interface Window {
    electron: {
      windowControls: {
        minimize: () => void;
        maximize: () => void;
        close: () => void;
      };
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
      fetch: (
        cookies: string,
        authorizedID?: string,
        csrf?: string,
      ) => Promise<{
        success: boolean;
        courses?: Course[];
        semester?: string;
        error?: string;
      }>;
      cgpa: (
        cookies: string,
        authorizedID?: string,
        csrf?: string,
      ) => Promise<{
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
        html?: string;
        error?: string;
      }>;
    };
    grade: {
      getExamGradeView: () => Promise<{
        success: boolean;
        html?: string;
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
    };
  }
}

export {};
