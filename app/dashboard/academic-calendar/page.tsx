"use client";

import { useEffect, useState } from "react";
import Loader from "@/components/Loader";

/* -------------------- Types -------------------- */

type AcademicCalendarItem = {
  label: string;
  dateValue: string;
};

type DayContent = {
  date: number;
  content: string[];
};

type MonthlySchedule = {
  month: string;
  days: DayContent[];
};

/* -------------------- Utility Functions -------------------- */

function createCalendarGrid(
  monthStr: string,
  days: DayContent[],
): (DayContent | null)[] {
  // Parse month and year from "FEBRUARY 2026"
  const [monthName, yearStr] = monthStr.split(" ");
  const year = parseInt(yearStr);
  const monthIndex = [
    "JANUARY",
    "FEBRUARY",
    "MARCH",
    "APRIL",
    "MAY",
    "JUNE",
    "JULY",
    "AUGUST",
    "SEPTEMBER",
    "OCTOBER",
    "NOVEMBER",
    "DECEMBER",
  ].indexOf(monthName.toUpperCase());

  if (monthIndex === -1) return days; // fallback

  // Get day of week for 1st of month (0 = Sunday, 1 = Monday, etc.)
  const firstDay = new Date(year, monthIndex, 1).getDay();

  // Create 42-cell grid
  const grid: (DayContent | null)[] = new Array(42).fill(null);

  // Place days starting from firstDay position
  days.forEach((day) => {
    const position = firstDay + (day.date - 1);
    if (position < 42) {
      grid[position] = day;
    }
  });

  return grid;
}

/* -------------------- Components -------------------- */

export default function AcademicCalendarPage() {
  const [data, setData] = useState<AcademicCalendarItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [calendarView, setCalendarView] = useState<MonthlySchedule | null>(
    null,
  );
  const [calendarLoading, setCalendarLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      console.log("Fetching academic calendar data...");
      try {
        if (window.academicCalendar) {
          const result = await window.academicCalendar.get();
          console.log(
            "Academic calendar fetch result:",
            result.success ? "success" : "error",
          );
          if (result.success) {
            setData(result.data || []);
          } else {
            setError(result.error || "Failed to fetch academic calendar");
          }
        } else {
          setError("Academic calendar service not available");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleMonthClick = async (dateValue: string) => {
    console.log("Fetching calendar view for:", dateValue);
    setCalendarLoading(true);
    if (window.academicCalendar?.getView) {
      try {
        const result = await window.academicCalendar.getView(dateValue);
        console.log("Calendar view result success:", result.success);
        if (result.success && result.data) {
          setCalendarView(result.data);
        } else {
          console.error(
            "Failed to fetch calendar view:",
            result.error || "Unknown error",
          );
        }
      } catch (error) {
        console.error("Error fetching calendar view:", error);
      }
    } else {
      console.error("getView method not available");
    }
    setCalendarLoading(false);
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Academic Calendar</h1>
        <p className="text-destructive">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Academic Calendar</h1>
      {calendarView ? (
        <div className="mb-6">
          <button
            onClick={() => setCalendarView(null)}
            className="mb-4 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Back to Months
          </button>
          <h2 className="text-xl font-semibold mb-4">{calendarView.month}</h2>
          {calendarLoading ? (
            <Loader />
          ) : (
            <div className="grid grid-cols-7 gap-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="p-2 font-semibold text-center border-b"
                >
                  {day}
                </div>
              ))}
              {createCalendarGrid(calendarView.month, calendarView.days).map(
                (day, index) => (
                  <div
                    key={index}
                    className="min-h-[100px] p-2 border rounded-lg bg-card"
                  >
                    {day && (
                      <>
                        <div className="font-semibold mb-1">{day.date}</div>
                        <div className="space-y-1">
                          {day.content.map((line, lineIndex) => (
                            <div
                              key={lineIndex}
                              className="text-xs text-muted-foreground"
                            >
                              {line}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                ),
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {data.map((item, index) => (
            <div
              key={index}
              className="p-4 border rounded-lg cursor-pointer hover:bg-muted transition-colors"
              onClick={() => handleMonthClick(item.dateValue)}
            >
              <p className="font-medium">{item.label}</p>
              <p className="text-sm text-muted-foreground">{item.dateValue}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
