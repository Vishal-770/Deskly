"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";

interface ConnectivityContextType {
  isOnline: boolean;
  isChecking: boolean;
  checkConnection: () => Promise<boolean>;
}

const ConnectivityContext = createContext<ConnectivityContextType | undefined>(
  undefined,
);

export function ConnectivityProvider({ children }: { children: ReactNode }) {
  const [isOnline, setIsOnline] = useState(true); // Assume online initially
  const [isChecking, setIsChecking] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const checkConnection = async () => {
    setIsChecking(true);
    try {
      const online = await window.network.checkInternet();
      setIsOnline(online);
      return online;
    } catch (error) {
      console.error("Connection check failed:", error);
      setIsOnline(false);
      return false;
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    // Initial check
    checkConnection();

    // Set up periodic checks every 10 seconds
    const interval = setInterval(checkConnection, 10000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Handle routing based on connectivity
    if (!isOnline && pathname !== "/no-internet") {
      router.push("/no-internet");
    } else if (isOnline && pathname === "/no-internet") {
      router.push("/");
    }
  }, [isOnline, pathname, router]);

  return (
    <ConnectivityContext.Provider
      value={{
        isOnline,
        isChecking,
        checkConnection,
      }}
    >
      {children}
    </ConnectivityContext.Provider>
  );
}

export function useConnectivity() {
  const context = useContext(ConnectivityContext);
  if (context === undefined) {
    throw new Error(
      "useConnectivity must be used within a ConnectivityProvider",
    );
  }
  return context;
}
