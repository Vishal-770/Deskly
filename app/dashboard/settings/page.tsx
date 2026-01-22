"use client";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/useAuth";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const SettingPage = () => {
  const { authState, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [logoutLoading, setLogoutLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !authState) {
      router.push("/");
    }
  }, [authState, authLoading, router]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="text-center space-y-3">
          <div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full mx-auto" />
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!authState) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="text-center space-y-3">
          <div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full mx-auto" />
          <p className="text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    );
  }

  async function handleLogout() {
    if (logoutLoading) return; // Prevent multiple clicks

    setLogoutLoading(true);
    try {
      await logout(); // Use the logout function from useAuth
      // Redirect to login page after successful logout
      router.push("/");
    } catch (err) {
      console.error("Logout failed:", err);
      // You could show an error toast here
    } finally {
      setLogoutLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings</p>
      </div>

      {/* Settings Content */}
      <div className="max-w-md mx-auto space-y-4">
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Account</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Status</span>
              <span className="text-sm text-green-600 font-medium">
                Logged In
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">User ID</span>
              <span className="text-sm text-muted-foreground">
                {authState?.userId || "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* Logout Section */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 text-red-600">
            Danger Zone
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Once you logout, you&apos;ll need to sign in again to access your
            account.
          </p>
          <Button
            onClick={handleLogout}
            disabled={logoutLoading}
            variant="destructive"
            className="w-full"
          >
            {logoutLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin h-4 w-4 border-b-2 border-white rounded-full" />
                Logging out...
              </div>
            ) : (
              "Logout"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingPage;
