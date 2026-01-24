import Store from "electron-store";
import keytar from "keytar";
import { loginService } from "./login.service";
import { Semester } from "@/types/electron/Semster.types";

const SERVICE = "Deskly";

/* =========================
   STORE SCHEMA
========================= */

const store = new Store() as any;

/* =========================
   TYPES
========================= */
export interface LoginPayload {
  userId: string;
  password: string;
}

/* =========================
   LOGIN
========================= */
export async function loginUser({ userId, password }: LoginPayload) {
  try {
    store.set("auth", {
      userId,
      loggedIn: true,
      lastLogin: Date.now(),
    });

    await keytar.setPassword(SERVICE, userId, password);
    return true;
  } catch (error) {
    console.error("Login Error:", error);
    return false;
  }
}

/* =========================
   AUTO LOGIN (session expired)
========================= */
export async function autoLogin(): Promise<boolean | null> {
  const auth = store.get("auth");
  if (!auth?.userId) return null;

  const password = await keytar.getPassword(SERVICE, auth.userId);
  if (!password) return null;

  let loginResult = null;

  try {
    // 🔹 First attempt
    loginResult = await loginService({
      username: auth.userId,
      password,
    });

    // 🔹 Retry once if missing tokens
    if (
      !loginResult?.authorizedID ||
      !loginResult?.cookies ||
      !loginResult?.csrf
    ) {
      console.warn("Auto-login failed, retrying once...");

      loginResult = await loginService({
        username: auth.userId,
        password,
      });
    }

    // 🔹 Final validation
    if (
      !loginResult?.authorizedID ||
      !loginResult?.cookies ||
      !loginResult?.csrf
    ) {
      console.error("Auto-login failed after retry");
      return null;
    }

    const { authorizedID, cookies, csrf } = loginResult;

    await setAuthTokens({ authorizedID, cookies, csrf });

    return true;
  } catch (err) {
    console.error("Auto-login error:", err);
    return false;
  }
}

/* =========================
   LOGOUT (NUKE EVERYTHING)
========================= */
export async function logoutUser() {
  const auth = store.get("auth");

  if (auth?.userId) {
    await keytar.deletePassword(SERVICE, auth.userId);
  }

  store.clear();
  return true;
}

/* =========================
   GET AUTH STATE
========================= */
export function getAuthState() {
  return store.get("auth") ?? null;
}

export interface SetAuthTokensPayload {
  authorizedID: string;
  csrf: string;
  cookies: string;
}

/**
 *
 * SET AUTH TOKENS IN USERS PC
 *
 */

export async function setAuthTokens({
  authorizedID,
  csrf,
  cookies,
}: SetAuthTokensPayload): Promise<boolean> {
  try {
    store.set("authTokens", {
      authorizedID,
      csrf,
      cookies,
    });
    return true;
  } catch (error) {
    console.error("Error setting auth tokens:", error);
    return false;
  }
}

/**
 *
 * GET AUTH TOKENS FROM USERS PC
 *
 */

export function getAuthTokens() {
  return store.get("authTokens") ?? null;
}

/**
 * CLEAR AUTH TOKENS AFTER A LOGOUT
 *
 *
 */

export async function clearAuthTokens(): Promise<boolean> {
  try {
    store.delete("authTokens");
    return true;
  } catch (error) {
    console.error("Error clearing auth tokens:", error);
    return false;
  }
}

/**
 *
 * Store Semester Info
 *
 */

export async function setSemesterInfo(semester: Semester): Promise<boolean> {
  try {
    store.set("currentSemester", semester);
    return true;
  } catch (error) {
    console.error("Error setting semester info:", error);
    return false;
  }
}
/**
 *
 * @returns Semester info from store
 *
 */
export function getSemesterInfo(): Semester | null {
  try {
    return store.get("currentSemester") ?? null;
  } catch (error) {
    console.error("Error getting semester info:", error);
    return null;
  }
}
/***
 * Clear Semester Info from store
 *
 */

export async function clearSemesterInfo(): Promise<boolean> {
  try {
    store.delete("currentSemester");
    return true;
  } catch (error) {
    console.error("Error clearing semester info:", error);
    return false;
  }
}
