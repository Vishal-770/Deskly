import type { SystemStats } from "../electron/system.types";
import type { StudentHistoryData } from "../../lib/electron/parsers/grade.htmlparser";

declare global {
  interface Window {
    system: {
      getStats: () => Promise<SystemStats>;
      login: (body: { username: string; password: string }) => Promise<{
        success: boolean;
        message?: string;
        error?: string;
        cookies?: string;
        csrf?: string;
        authorizedID?: string;
      }>;
      onCpuUpdate: (callback: (cpu: number) => void) => void;
      getContent: (
        cookies: string,
        authorizedID?: string,
        csrf?: string,
      ) => Promise<{
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
      }>;
    };
    auth: {
      login(data: { userId: string; password: string }): Promise<boolean>;
      autoLogin(): Promise<{ userId: string } | null>;
      logout(): Promise<boolean>;
      get(): Promise<{ userId: string } | null>;
    };
    grade: {
      getExamGradeView(): Promise<{
        success: boolean;
        data?: StudentHistoryData;
        error?: string;
      }>;
    };
  }
}
