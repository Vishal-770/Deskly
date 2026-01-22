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

  const logout = async () => {
    try {
      setLoading(true);
      await window.auth.logout();
      setAuthState(null);
      // Clear any stored auth data
      sessionStorage.removeItem("vtp_cookies");
      sessionStorage.removeItem("vtp_authorizedID");
      sessionStorage.removeItem("vtp_csrf");
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
  };
};
