"use client";
import React, { useEffect, useState } from "react";
import { WeeklyScheduleResponse } from "../../../types/renderer/Course.types";
import { WeeklySchedule } from "../../../types/electron/TimeTable.types";
export default function TimetablePage() {
  const [timetable, setTimetable] = useState<WeeklySchedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const response: WeeklyScheduleResponse =
          await window.timetable.currentSemester();
        if (response.success && response.data) {
          setTimetable(response.data);
        } else {
          setError(response.error || "Failed to load timetable");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchTimetable();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center space-y-1">
        <h1 className="text-3xl font-bold">Error</h1>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (!timetable) {
    return (
      <div className="text-center space-y-1">
        <h1 className="text-3xl font-bold">No Timetable</h1>
        <p className="text-muted-foreground">No timetable data available</p>
      </div>
    );
  }

  const days = Object.keys(timetable) as (keyof WeeklySchedule)[];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-1">
        <h1 className="text-3xl font-bold">Timetable</h1>
        <p className="text-muted-foreground">Current semester schedule</p>
      </div>

      {/* Timetable Grid */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {days.map((day) => (
          <div key={day} className="rounded-xl border bg-card p-4 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-center">{day}</h3>
            <div className="space-y-2">
              {timetable[day].map((session, index) => (
                <div
                  key={index}
                  className="p-3 bg-primary/10 rounded-lg border"
                >
                  <div className="text-sm font-medium">
                    {session.courseCode} ({session.slot})
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {session.courseTitle}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {session.startTime} - {session.endTime}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {session.venue}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {session.faculty}
                  </div>
                </div>
              ))}
              {timetable[day].length === 0 && (
                <div className="text-center text-muted-foreground text-sm">
                  No classes
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
