"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";
import { useConnectivity } from "@/components/connectivity-provider";

export default function NoInternetPage() {
  const { isOnline, isChecking, checkConnection } = useConnectivity();
  const router = useRouter();

  useEffect(() => {
    if (isOnline) {
      // Redirect to home if connection is restored
      router.push("/");
    }
  }, [isOnline, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 p-8 max-w-md">
        <div className="flex justify-center">
          <div className="p-4 rounded-full bg-red-100">
            <WifiOff className="h-12 w-12 text-red-600" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            No Internet Connection
          </h1>
          <p className="text-muted-foreground">
            Please check your internet connection and try again.
          </p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={checkConnection}
            disabled={isChecking}
            className="w-full"
          >
            {isChecking ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <Wifi className="mr-2 h-4 w-4" />
                Try Again
              </>
            )}
          </Button>

          <div className="text-sm text-muted-foreground">
            <p>Make sure you're connected to the internet</p>
            <p>Connection will be checked automatically</p>
          </div>
        </div>
      </div>
    </div>
  );
}
