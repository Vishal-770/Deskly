"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { ModeToggle } from "@/components/Modetoggle";
import { useAuth } from "@/components/useAuth";
import { useSemester } from "@/components/useSemester";

import { Semester } from "@/types/electron/Semster.types";
import Loader from "@/components/Loader";

interface UpdateInfo {
  version: string;
  // Add other properties if needed, e.g., releaseNotes, etc.
}
const SettingPage = () => {
  const router = useRouter();
  const { authState, loading: authLoading, logout, getAuthTokens } = useAuth();
  const {
    currentSemester,
    loading: semesterLoading,
    setSemester,
  } = useSemester();

  const [logoutLoading, setLogoutLoading] = useState(false);
  const [tokens, setTokens] = useState<{
    authorizedID: string;
    csrf: string;
    cookies: string;
  } | null>(null);

  const [availableSemesters, setAvailableSemesters] = useState<Semester[]>([]);
  const [fetchingSemesters, setFetchingSemesters] = useState(false);

  const [selectedMess, setSelectedMess] = useState<string>("");
  const [selectedBlock, setSelectedBlock] = useState<string>("");
  const [settingsLoading, setSettingsLoading] = useState(false);

  // Updater states
  const [updateStatus, setUpdateStatus] = useState<string>("idle");
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [checkingUpdate, setCheckingUpdate] = useState(false);

  // App version state
  const [appVersion, setAppVersion] = useState<string>("Loading...");

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

  useEffect(() => {
    if (!authLoading && authState) loadSettings();
  }, [authLoading, authState]);

  useEffect(() => {
    if (typeof window !== "undefined" && window.updater) {
      // Set up updater event listeners
      window.updater.onUpdateChecking(() => {
        setUpdateStatus("checking");
      });

      window.updater.onUpdateAvailable((info) => {
        setUpdateStatus("available");
        setUpdateInfo(info);
      });

      window.updater.onUpdateNotAvailable(() => {
        setUpdateStatus("not-available");
      });

      window.updater.onUpdateError((error) => {
        setUpdateStatus("error");
        console.error("Update error:", error);
      });

      window.updater.onDownloadProgress((progress) => {
        setUpdateStatus("downloading");
        setDownloadProgress(progress.percent);
      });

      window.updater.onUpdateDownloaded((info) => {
        setUpdateStatus("downloaded");
        setUpdateInfo(info);
      });
    }
  }, []);

  useEffect(() => {
    const fetchVersion = async () => {
      try {
        const version = await window.system.version();
        setAppVersion(version);
      } catch (error) {
        console.error("Failed to fetch app version:", error);
        setAppVersion("Unknown");
      }
    };

    fetchVersion();
  }, []);

  /* ---------------- ACTIONS ---------------- */

  const loadSettings = async () => {
    try {
      const [messType, laundryBlock] = await Promise.all([
        window.settings.getMessType(),
        window.settings.getLaundryBlock(),
      ]);
      setSelectedMess(messType || "");
      setSelectedBlock(laundryBlock || "");
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  };

  const saveMessType = async (messType: string) => {
    setSettingsLoading(true);
    try {
      await window.settings.setMessType(messType);
      setSelectedMess(messType);
    } catch (error) {
      console.error("Failed to save mess type:", error);
    } finally {
      setSettingsLoading(false);
    }
  };

  const saveLaundryBlock = async (block: string) => {
    setSettingsLoading(true);
    try {
      await window.settings.setLaundryBlock(block);
      setSelectedBlock(block);
    } catch (error) {
      console.error("Failed to save laundry block:", error);
    } finally {
      setSettingsLoading(false);
    }
  };

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

  const handleCheckForUpdates = async () => {
    if (checkingUpdate) return;
    setCheckingUpdate(true);
    setUpdateStatus("checking");
    try {
      const result = await window.updater.checkForUpdates();
      if (!result.success) {
        setUpdateStatus("error");
        console.error("Update check failed:", result.error);
      }
    } catch (error) {
      setUpdateStatus("error");
      console.error("Update check error:", error);
    } finally {
      setCheckingUpdate(false);
    }
  };

  const handleDownloadUpdate = async () => {
    setUpdateStatus("downloading");
    try {
      const result = await window.updater.downloadUpdate();
      if (!result.success) {
        setUpdateStatus("error");
        console.error("Download failed:", result.error);
      }
    } catch (error) {
      setUpdateStatus("error");
      console.error("Download error:", error);
    }
  };

  const handleInstallUpdate = () => {
    window.updater.installUpdate();
  };

  /* ---------------- LOADING ---------------- */

  if (authLoading) return <Loader />;
  if (!authState) return <Loader />;

  /* ---------------- UI ---------------- */

  return (
    <div className="w-full h-full px-6 py-6">
      <div className="max-w-4xl mx-auto space-y-6">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Account */}
          <div className="space-y-6">
            <h2 className="text-lg font-medium">Account</h2>
            <div className="space-y-5 text-sm">
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
            </div>
          </div>

          {/* Semester */}
          <div className="space-y-6">
            <h2 className="text-lg font-medium">Semester</h2>
            <div className="space-y-5 text-sm">
              <Row label="Current">
                <span className="text-muted-foreground">
                  {semesterLoading
                    ? "Loading…"
                    : currentSemester?.name || "Not set"}
                </span>
              </Row>

              <div className="space-y-6">
                <Select
                  value={currentSemester?.id}
                  onValueChange={(value) => {
                    const sem = availableSemesters.find((s) => s.id === value);
                    if (sem) setSemester(sem);
                  }}
                >
                  <SelectTrigger
                    className="w-full"
                    disabled={semesterLoading || fetchingSemesters}
                  >
                    <SelectValue placeholder="Choose semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSemesters.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={fetchAvailableSemesters}
                  disabled={fetchingSemesters}
                >
                  Refresh
                </Button>
              </div>
            </div>
          </div>

          {/* Mess Settings */}
          <div className="space-y-6">
            <h2 className="text-lg font-medium">Mess Preferences</h2>
            <div className="space-y-5 text-sm">
              <Row label="Current Mess">
                <span className="text-muted-foreground">
                  {selectedMess || "Not set"}
                </span>
              </Row>

              <div className="space-y-6">
                <Select
                  value={selectedMess}
                  onValueChange={saveMessType}
                  disabled={settingsLoading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose mess type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Veg-mens">Veg - Mens</SelectItem>
                    <SelectItem value="Non-Veg-mens">Non-Veg - Mens</SelectItem>
                    <SelectItem value="Special-mens">Special - Mens</SelectItem>
                    <SelectItem value="Veg-womens">Veg - Womens</SelectItem>
                    <SelectItem value="Non-Veg-womens">
                      Non-Veg - Womens
                    </SelectItem>
                    <SelectItem value="Special-womens">
                      Special - Womens
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Laundry Settings */}
          <div className="space-y-6">
            <h2 className="text-lg font-medium">Laundry Preferences</h2>
            <div className="space-y-5 text-sm">
              <Row label="Current Block">
                <span className="text-muted-foreground">
                  {selectedBlock || "Not set"}
                </span>
              </Row>

              <div className="space-y-6">
                <Select
                  value={selectedBlock}
                  onValueChange={saveLaundryBlock}
                  disabled={settingsLoading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose block" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">Block A</SelectItem>
                    <SelectItem value="B">Block B</SelectItem>
                    <SelectItem value="CB">Block CB</SelectItem>
                    <SelectItem value="CG">Block CG</SelectItem>
                    <SelectItem value="D1">Block D1</SelectItem>
                    <SelectItem value="D2">Block D2</SelectItem>
                    <SelectItem value="E">Block E</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* App Updates */}
          <div className="md:col-span-2 space-y-6 pt-4">
            <h2 className="text-lg font-medium">App Updates</h2>
            <div className="space-y-5 text-sm">
              <Row label="Current Version">
                <span className="text-muted-foreground">v{appVersion}</span>
              </Row>

              <Row label="Update Status">
                {updateStatus === "idle" && (
                  <Badge variant="secondary">Ready to check</Badge>
                )}
                {updateStatus === "checking" && (
                  <Badge variant="secondary">Checking...</Badge>
                )}
                {updateStatus === "available" && (
                  <Badge variant="default">Update Available</Badge>
                )}
                {updateStatus === "not-available" && (
                  <Badge variant="secondary">Up to date</Badge>
                )}
                {updateStatus === "downloading" && (
                  <Badge variant="secondary">
                    Downloading {downloadProgress.toFixed(0)}%
                  </Badge>
                )}
                {updateStatus === "downloaded" && (
                  <Badge variant="default">Ready to Install</Badge>
                )}
                {updateStatus === "error" && (
                  <Badge variant="destructive">Error</Badge>
                )}
              </Row>

              {updateInfo && (
                <Row label="Latest Version">
                  <span className="text-muted-foreground">
                    v{updateInfo.version}
                  </span>
                </Row>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCheckForUpdates}
                  disabled={
                    checkingUpdate ||
                    updateStatus === "checking" ||
                    updateStatus === "downloading"
                  }
                >
                  {checkingUpdate ? "Checking..." : "Check for Updates"}
                </Button>

                {updateStatus === "available" && (
                  <Button
                    size="sm"
                    variant="default"
                    onClick={handleDownloadUpdate}
                  >
                    Download Update
                  </Button>
                )}

                {updateStatus === "downloaded" && (
                  <Button
                    size="sm"
                    variant="default"
                    onClick={handleInstallUpdate}
                  >
                    Install & Restart
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Logout - spans full width */}
          <div className="md:col-span-2 space-y-6 pt-4">
            <div className="space-y-4 text-sm">
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
            </div>
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

export default SettingPage;
