"use client";

import { useEffect, useState } from "react";

export interface AuthState {
  userId: string;
  loggedIn: boolean;
  lastLogin: number;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAuthState = async () => {
    try {
      if (!window.auth) {
        console.error("window.auth is not available");
        setAuthState(null);
        setLoading(false);
        return;
      }
      const state = await window.auth.get();
      setAuthState(state);
    } catch (error) {
      console.error("Failed to get auth state:", error);
      setAuthState(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuthState();
  }, []);

  const getAuthTokens = async () => {
    try {
      const tokens = await window.auth.getTokens();
      return tokens;
    } catch (error) {
      console.error("Failed to get auth tokens:", error);
      return null;
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      // Get the tokens from electron store
      const tokens = await getAuthTokens();
      if (tokens) {
        await window.login.logout({
          cookies: tokens.cookies,
          authorizedID: tokens.authorizedID,
          csrf: tokens.csrf,
        });
      }
      await window.auth.logout();
      setAuthState(null);
      // Clear any stored auth data
      sessionStorage.removeItem("vtp_cookies");
      sessionStorage.removeItem("vtp_authorizedID");
      sessionStorage.removeItem("vtp_csrf");
      await window.auth.deleteTokens();
    } catch (error) {
      console.error("Logout failed:", error);
      throw error; // Re-throw so caller can handle
    } finally {
      setLoading(false);
    }
  };

  return {
    authState,
    loading,
    isLoggedIn: authState?.loggedIn || false,
    logout,
    refreshAuthState: fetchAuthState,
    getAuthTokens,
  };
};
