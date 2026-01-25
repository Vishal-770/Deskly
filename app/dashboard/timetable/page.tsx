"use client";
import React, { useEffect, useState, useMemo } from "react";
import { Clock, MapPin, User, BookOpen, Calendar } from "lucide-react";

import { WeeklyScheduleResponse } from "../../../types/renderer/Course.types";
import { WeeklySchedule } from "../../../types/electron/TimeTable.types";
import { cn } from "@/lib/renderer/utils";
import Loader from "@/components/Loader";

// Types based on the original file
interface Session {
  courseCode: string;
  slot: string;
  courseTitle: string;
  startTime: string;
  endTime: string;
  venue: string;
  faculty: string;
}

const dayShortNames: Record<keyof WeeklySchedule, string> = {
  Monday: "Mon",
  Tuesday: "Tue",
  Wednesday: "Wed",
  Thursday: "Thu",
  Friday: "Fri",
  Saturday: "Sat",
  Sunday: "Sun",
};

function SessionCard({ session, index }: { session: Session; index: number }) {
  return (
    <div className="relative overflow-hidden rounded-lg border bg-card p-4">
      {/* Content */}
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold tracking-tight text-foreground">
                {session.courseCode}
              </span>
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                {session.slot}
              </span>
            </div>
            <h4 className="mt-1 text-sm font-medium text-foreground/80 leading-snug">
              {session.courseTitle}
            </h4>
          </div>
        </div>

        {/* Details */}
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            <span>
              {session.startTime} – {session.endTime}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            <span>{session.venue}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <User className="h-3.5 w-3.5" />
          <span>{session.faculty}</span>
        </div>
      </div>
    </div>
  );
}

function EmptyDay() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="rounded-full bg-muted/50 p-4 mb-4">
        <Calendar className="h-8 w-8 text-muted-foreground/50" />
      </div>
      <p className="text-lg font-medium text-muted-foreground">
        No classes scheduled
      </p>
      <p className="text-sm text-muted-foreground/70 mt-1">
        Enjoy your free day!
      </p>
    </div>
  );
}

function ErrorState({ error }: { error: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
      <div className="rounded-full bg-destructive/10 p-4 mb-4">
        <BookOpen className="h-8 w-8 text-destructive" />
      </div>
      <h2 className="text-xl font-semibold text-foreground">
        Unable to load timetable
      </h2>
      <p className="text-sm text-muted-foreground mt-2 max-w-md">{error}</p>
    </div>
  );
}

function NoDataState() {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
      <div className="rounded-full bg-muted/50 p-4 mb-4">
        <Calendar className="h-8 w-8 text-muted-foreground/50" />
      </div>
      <h2 className="text-xl font-semibold text-foreground">
        No timetable available
      </h2>
      <p className="text-sm text-muted-foreground mt-2">
        Check back when the semester schedule is released
      </p>
    </div>
  );
}

export default function TimetablePage() {
  const [timetable, setTimetable] = useState<WeeklySchedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeDay, setActiveDay] = useState<keyof WeeklySchedule | null>(null);

  // Get current day for default tab
  const currentDay = useMemo(() => {
    const days: (keyof WeeklySchedule)[] = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return days[new Date().getDay()];
  }, []);

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const response: WeeklyScheduleResponse =
          await window.timetable.currentSemester();
        if (response.success && response.data) {
          setTimetable(response.data);
          setActiveDay(currentDay);
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
  }, [currentDay]);

  if (loading) return <Loader />;
  if (error) return <ErrorState error={error} />;
  if (!timetable) return <NoDataState />;

  const days = Object.keys(timetable) as (keyof WeeklySchedule)[];

  // Calculate total classes for each day
  const classCount = (day: keyof WeeklySchedule) => timetable[day].length;

  return (
    <div className="min-h-screen bg-background">
      {/* Main content */}
      <main className="mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header content */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Timetable
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Current semester schedule
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* Day tabs */}
        <div className="mb-6 flex flex-wrap gap-1">
          {days.map((day) => (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={cn(
                "relative rounded-full border-0 bg-muted/50 px-4 py-2 text-sm font-medium transition-all hover:bg-muted",
                activeDay === day && "bg-foreground text-background shadow-md",
              )}
            >
              <span className="hidden sm:inline">{day}</span>
              <span className="sm:hidden">{dayShortNames[day]}</span>
              {classCount(day) > 0 && (
                <span
                  className={cn(
                    "ml-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full text-xs",
                    activeDay === day ? "bg-background/30" : "bg-background/20",
                  )}
                >
                  {classCount(day)}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Day content */}
        {activeDay && (
          <div className="outline-none">
            {timetable[activeDay].length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
                {timetable[activeDay].map((session, index) => (
                  <SessionCard
                    key={`${session.courseCode}-${index}`}
                    session={session}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <EmptyDay />
            )}
          </div>
        )}
      </main>
    </div>
  );
}
