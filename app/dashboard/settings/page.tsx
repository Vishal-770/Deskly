"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/Modetoggle";
import { useAuth } from "@/components/useAuth";
import { useSemester } from "@/components/useSemester";
import { Semester } from "@/types/electron/Semster.types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

const SettingPage = () => {
  const router = useRouter();

  const { authState, loading: authLoading, logout, getAuthTokens } = useAuth();
  const {
    currentSemester,
    loading: semesterLoading,
    setSemester,
    clearSemester,
  } = useSemester();

  const [logoutLoading, setLogoutLoading] = useState(false);
  const [tokens, setTokens] = useState<{
    authorizedID: string;
    csrf: string;
    cookies: string;
  } | null>(null);

  const [availableSemesters, setAvailableSemesters] = useState<Semester[]>([]);
  const [fetchingSemesters, setFetchingSemesters] = useState(false);

  /* -------------------- EFFECTS -------------------- */

  useEffect(() => {
    const fetchTokens = async () => {
      const t = await getAuthTokens();
      setTokens(t);
    };
    fetchTokens();
  }, [getAuthTokens]);

  useEffect(() => {
    if (!authLoading && !authState) {
      router.push("/");
    }
  }, [authLoading, authState, router]);

  useEffect(() => {
    if (!authLoading && authState) {
      fetchAvailableSemesters();
    }
  }, [authLoading, authState]);

  /* -------------------- ACTIONS -------------------- */

  const fetchAvailableSemesters = async () => {
    setFetchingSemesters(true);
    try {
      const result = await window.auth.getSemesters();
      if (result.success && result.semesters) {
        setAvailableSemesters(result.semesters);
      } else {
        console.error(result.error);
      }
    } catch (err) {
      console.error("Semester fetch failed:", err);
    } finally {
      setFetchingSemesters(false);
    }
  };

  const handleLogout = async () => {
    if (logoutLoading) return;
    setLogoutLoading(true);
    try {
      await logout();
      router.push("/");
    } finally {
      setLogoutLoading(false);
    }
  };

  /* -------------------- LOADING STATES -------------------- */

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader text="Loading settings..." />
      </div>
    );
  }

  if (!authState) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader text="Redirecting..." />
      </div>
    );
  }

  /* -------------------- UI -------------------- */

  return (
    <div className="w-full h-full px-6 py-5 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-semibold">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage account and application preferences
          </p>
        </div>
        <ModeToggle />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        {/* LEFT COLUMN */}
        <div className="space-y-8">
          {/* Account */}
          <Section title="Account">
            <SettingRow label="Status">
              <span className="text-green-600 font-medium">Logged In</span>
            </SettingRow>

            <SettingRow label="User ID">
              <span className="text-muted-foreground">
                {authState.userId || "N/A"}
              </span>
            </SettingRow>

            <SettingRow label="Auth Tokens">
              <span className="text-muted-foreground">
                {tokens ? "Stored" : "Not stored"}
              </span>
            </SettingRow>
          </Section>

          {/* Semester */}
          <Section title="Semester">
            <SettingRow label="Current Semester">
              <span className="text-muted-foreground">
                {semesterLoading
                  ? "Loading..."
                  : currentSemester?.name || "Not set"}
              </span>
            </SettingRow>

            <div className="space-y-2">
              <label className="text-sm font-medium">Select Semester</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between"
                    disabled={semesterLoading || fetchingSemesters}
                  >
                    {currentSemester?.name || "Choose semester"}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {availableSemesters.map((s) => (
                    <DropdownMenuItem
                      key={s.id}
                      onClick={async () => {
                        await setSemester(s);
                      }}
                    >
                      {s.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={fetchAvailableSemesters}
                disabled={fetchingSemesters}
              >
                {fetchingSemesters ? "Refreshing..." : "Refresh"}
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={clearSemester}
                disabled={semesterLoading}
              >
                Clear
              </Button>
            </div>
          </Section>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-8">
          <Section title="Danger Zone" danger>
            <p className="text-sm text-muted-foreground mb-4">
              Logging out will remove all session data from this device.
            </p>

            <Button
              variant="destructive"
              onClick={handleLogout}
              disabled={logoutLoading}
            >
              {logoutLoading ? "Logging out..." : "Logout"}
            </Button>
          </Section>
        </div>
      </div>
    </div>
  );
};

/* -------------------- REUSABLE UI -------------------- */

const Section = ({
  title,
  children,
  danger,
}: {
  title: string;
  children: React.ReactNode;
  danger?: boolean;
}) => (
  <section>
    <h2
      className={`text-lg font-semibold mb-3 ${danger ? "text-red-600" : ""}`}
    >
      {title}
    </h2>
    <div className="space-y-3">{children}</div>
  </section>
);

const SettingRow = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="flex items-center justify-between gap-4 text-sm">
    <span className="text-muted-foreground">{label}</span>
    {children}
  </div>
);

const Loader = ({ text }: { text: string }) => (
  <div className="flex flex-col items-center gap-3">
    <div className="animate-spin h-6 w-6 border-b-2 border-primary rounded-full" />
    <p className="text-sm text-muted-foreground">{text}</p>
  </div>
);

export default SettingPage;
