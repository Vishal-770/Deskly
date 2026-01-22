import Store from "electron-store";
import keytar from "keytar";

const SERVICE = "Deskly";

/* =========================
   STORE SCHEMA
========================= */
interface AuthSchema {
  auth?: {
    userId: string;
    loggedIn: boolean;
    lastLogin: number;
  };
}

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
export async function autoLogin() {
  const auth = store.get("auth");
  if (!auth?.userId) return null;

  const password = await keytar.getPassword(SERVICE, auth.userId);
  if (!password) return null;

  // 🔥 call backend login here
  return {
    userId: auth.userId,
    password, // use internally, DO NOT expose to UI
  };
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
