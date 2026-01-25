"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { ModeToggle } from "@/components/Modetoggle";
import { useAuth } from "@/components/useAuth";
import { useSemester } from "@/components/useSemester";

import { ChevronDown } from "lucide-react";
import { Semester } from "@/types/electron/Semster.types";

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

  /* ---------------- EFFECTS ---------------- */

  useEffect(() => {
    getAuthTokens().then(setTokens);
  }, [getAuthTokens]);

  useEffect(() => {
    if (!authLoading && !authState) router.push("/");
  }, [authLoading, authState, router]);

  useEffect(() => {
    if (!authLoading && authState) fetchAvailableSemesters();
  }, [authLoading, authState]);

  /* ---------------- ACTIONS ---------------- */

  const fetchAvailableSemesters = async () => {
    setFetchingSemesters(true);
    try {
      const result = await window.auth.getSemesters();
      if (result.success && result.semesters) {
        setAvailableSemesters(result.semesters);
      }
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

  /* ---------------- LOADING ---------------- */

  if (authLoading) return <CenteredLoader text="Loading settings…" />;
  if (!authState) return <CenteredLoader text="Redirecting…" />;

  /* ---------------- UI ---------------- */

  return (
    <div className="w-full h-full px-6 py-6">
      <div className="max-w-[1400px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
            <p className="text-sm text-muted-foreground">
              Account & application preferences
            </p>
          </div>
          <ModeToggle />
        </div>

        <Separator />

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT */}
          <div className="space-y-6">
            {/* Account */}
            <Card>
              <CardHeader className="pb-3">
                <h2 className="text-lg font-medium">Account</h2>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <Row label="Status">
                  <Badge variant="secondary">Logged In</Badge>
                </Row>

                <Row label="User ID">
                  <span className="text-muted-foreground">
                    {authState.userId}
                  </span>
                </Row>

                <Row label="Auth Tokens">
                  <span className="text-muted-foreground">
                    {tokens ? "Stored locally" : "Not available"}
                  </span>
                </Row>
              </CardContent>
            </Card>

            {/* Semester */}
            <Card>
              <CardHeader className="pb-3">
                <h2 className="text-lg font-medium">Semester</h2>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <Row label="Current">
                  <span className="text-muted-foreground">
                    {semesterLoading
                      ? "Loading…"
                      : currentSemester?.name || "Not set"}
                  </span>
                </Row>

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

                    <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]">
                      {availableSemesters.map((s) => (
                        <DropdownMenuItem
                          key={s.id}
                          onClick={() => setSemester(s)}
                        >
                          {s.name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={fetchAvailableSemesters}
                    disabled={fetchingSemesters}
                  >
                    Refresh
                  </Button>
                  <Button size="sm" variant="outline" onClick={clearSemester}>
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT */}
          <div>
            <Card className="border-destructive/40">
              <CardHeader className="pb-3">
                <h2 className="text-lg font-medium text-destructive">
                  Danger Zone
                </h2>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p className="text-muted-foreground">
                  Logging out will remove all session data from this device.
                </p>
                <Button
                  variant="destructive"
                  onClick={handleLogout}
                  disabled={logoutLoading}
                >
                  {logoutLoading ? "Logging out…" : "Logout"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ---------------- UI HELPERS ---------------- */

const Row = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="flex items-center justify-between gap-4">
    <span className="text-muted-foreground">{label}</span>
    {children}
  </div>
);

const CenteredLoader = ({ text }: { text: string }) => (
  <div className="flex h-full items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted border-t-primary" />
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  </div>
);

export default SettingPage;
