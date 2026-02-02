"use client";

import React, { useState, useEffect } from "react";
import { LaundaryEntry } from "@/types/electron/Laundary.types";
import { useAuth } from "@/components/useAuth";
import Loader from "@/components/Loader";
import { WashingMachine } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ErrorDisplay } from "@/components/error-display";

const BLOCKS = ["A", "B", "CB", "CG", "D1", "D2", "E"];

const LaundryPage: React.FC = () => {
  const { authState, loading } = useAuth();
  const [laundaryData, setLaundaryData] = useState<LaundaryEntry[] | null>(
    null,
  );
  const [laundaryLoading, setLaundaryLoading] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<string>("");
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  const fetchLaundary = async (block: string) => {
    setLaundaryLoading(true);
    setLaundaryData(null);
    setError(null);
    try {
      const result = await window.laundary.getSchedule(block);
      if (result.success) {
        setLaundaryData(result.data || []);
      } else {
        setError(result.error || "Failed to fetch laundry schedule");
      }
    } catch {
      setError("Failed to fetch laundry schedule");
    } finally {
      setLaundaryLoading(false);
    }
  };

  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1).getDay();

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const laundryBlock = await window.settings.getLaundryBlock();
        setSelectedBlock(laundryBlock || "");
        if (laundryBlock) {
          fetchLaundary(laundryBlock);
        }
      } catch (error) {
        console.error("Failed to load laundry settings:", error);
      } finally {
        setSettingsLoaded(true);
      }
    };
    loadSettings();
  }, []);

  const scheduleByDay =
    laundaryData?.reduce(
      (acc, entry) => {
        const day = parseInt(entry.Date);
        if (!acc[day]) acc[day] = [];
        if (entry.RoomNumber) {
          acc[day].push(entry.RoomNumber);
        }
        return acc;
      },
      {} as Record<number, string[]>,
    ) || {};

  if (loading) return <Loader />;

  if (!authState) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Please log in to view laundry schedules
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-background px-10 py-8">
      <div className="mb-8 flex items-center gap-3">
        <WashingMachine className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-semibold">Laundry Schedule</h1>
          <p className="text-sm text-muted-foreground">
            View laundry Schedule per block
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6">
          <ErrorDisplay
            title="Failed to Load Laundry Schedule"
            message={error}
            onRetry={() => selectedBlock && fetchLaundary(selectedBlock)}
          />
        </div>
      )}

      <div className="h-[calc(100%-5rem)]">
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Current Block:
            </span>
            <span className="text-sm font-medium">
              {settingsLoaded
                ? selectedBlock
                  ? `Block ${selectedBlock}`
                  : "Not set"
                : "Loading..."}
            </span>
          </div>
        </div>
        <div className="h-[calc(100%-4rem)] py-4">
          {laundaryLoading ? (
            <div className="flex h-full items-center justify-center">
              <Loader />
            </div>
          ) : laundaryData ? (
            laundaryData.length ? (
              <>
                <div className="text-center text-sm font-medium mb-4 px-4">
                  {new Date().toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </div>
                <div className="overflow-x-auto px-2">
                  <div className="min-w-[700px] grid grid-cols-7 gap-2 mb-4">
                    {dayNames.map((day) => (
                      <div
                        key={day}
                        className="text-center text-sm font-medium text-muted-foreground py-2"
                      >
                        {day}
                      </div>
                    ))}
                  </div>
                  <div className="min-w-[700px] grid grid-cols-7 gap-2">
                    {Array.from({ length: firstDayOfMonth }, (_, i) => (
                      <div
                        key={`empty-${i}`}
                        className="min-h-16 sm:min-h-20"
                      ></div>
                    ))}
                    {Array.from({ length: daysInMonth }, (_, i) => {
                      const day = i + 1;
                      const rooms = scheduleByDay[day] || [];
                      const displayText =
                        rooms.length > 0 ? rooms.join(", ") : null;
                      return (
                        <div
                          key={day}
                          className={`min-h-16 sm:min-h-20 border rounded-md p-1 sm:p-2 text-xs sm:text-sm flex flex-col items-center justify-center ${
                            displayText
                              ? "bg-primary/10 border-primary/20"
                              : "border-muted"
                          }`}
                        >
                          <div className="font-medium text-sm sm:text-base">
                            {day}
                          </div>
                          {displayText && (
                            <div className="text-muted-foreground text-[10px] sm:text-xs leading-tight text-center mt-1">
                              {displayText}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No schedule available
              </div>
            )
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Select a block from the dropdown
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LaundryPage;
