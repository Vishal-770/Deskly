import axios from "axios";
import { autoLogin, getAuthTokens } from "./storeAuth.service";

export interface AuthTokens {
  authorizedID: string;
  csrf: string;
  cookies: string;
}

/**
 * Handles authentication-related errors (401, 403, 404) by attempting auto-login and retrying the request with new tokens.
 * @param err The error caught in the try-catch block.
 * @param retryCallback A function that takes new tokens and retries the original request.
 * @returns The result of the retry callback if relogin succeeds, otherwise throws the original error.
 */
export async function handleAuthErrorAndRetry<T>(
  err: unknown,
  retryCallback: (tokens: AuthTokens) => Promise<T>,
): Promise<T> {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    if (status === 401 || status === 403 || status === 404) {
      const response = await autoLogin();

      if (response === true) {
        const newTokens = getAuthTokens();
        if (newTokens) {
          console.log(
            "[HANDLE AUTH ERROR] Auto-login successful. Retrying request with new tokens.",
          );
          return retryCallback(newTokens);
        } else {
          console.error(
            "[HANDLE AUTH ERROR] Failed to get new tokens after relogin.",
          );
        }
      } else if (response === false) {
        console.error(
          "[HANDLE AUTH ERROR] Auto-login failed due to invalid credentials.",
        );
      } else if (response === null) {
        console.error(
          "[HANDLE AUTH ERROR] Auto-login failed - no stored credentials.",
        );
      }
    }
  }

  // If not an auth error or relogin failed, re-throw the error
  throw err;
}
