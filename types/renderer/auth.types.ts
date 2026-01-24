import { Semester } from "../electron/Semster.types";

export interface AuthAPI {
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
}
