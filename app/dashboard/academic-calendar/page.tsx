"use client";

import { useEffect, useState } from "react";
import Loader from "@/components/Loader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "lucide-react";
// Swiper for horizontal swipe on calendar
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

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

  // Find the last non-null cell
  let lastNonNullIndex = -1;
  for (let i = grid.length - 1; i >= 0; i--) {
    if (grid[i] !== null) {
      lastNonNullIndex = i;
      break;
    }
  }

  // Trim empty rows at the end (7 cells per row)
  if (lastNonNullIndex >= 0) {
    const lastRowStart = Math.floor(lastNonNullIndex / 7) * 7;
    return grid.slice(0, lastRowStart + 7);
  }

  return grid;
}

/* -------------------- Components -------------------- */

export default function AcademicCalendarPage() {
  const [data, setData] = useState<AcademicCalendarItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [calendarData, setCalendarData] = useState<
    Record<string, MonthlySchedule>
  >({});
  const [activeTab, setActiveTab] = useState<string>("");

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
            // Set first month as active tab if available
            if (result.data && result.data.length > 0) {
              const firstDate = result.data[0].dateValue;
              setActiveTab(firstDate);

              // Immediately fetch the view for the first month so it shows on mount
              try {
                if (window.academicCalendar?.getView) {
                  const viewRes =
                    await window.academicCalendar.getView(firstDate);
                  console.log(
                    "Initial calendar view fetch success:",
                    viewRes.success,
                  );
                  if (viewRes.success && viewRes.data) {
                    setCalendarData((prev) => ({
                      ...prev,
                      [firstDate]: viewRes.data as MonthlySchedule,
                    }));
                  } else {
                    console.error(
                      "Failed to fetch initial calendar view:",
                      viewRes.error,
                    );
                  }
                }
              } catch (err) {
                console.error("Error fetching initial calendar view:", err);
              }
            }
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

  const handleTabChange = async (dateValue: string) => {
    setActiveTab(dateValue);

    // Fetch calendar data if not already loaded
    if (!calendarData[dateValue]) {
      console.log("Fetching calendar view for:", dateValue);
      if (window.academicCalendar?.getView) {
        try {
          const result = await window.academicCalendar.getView(dateValue);
          console.log("Calendar view result success:", result.success);
          if (result.success && result.data) {
            setCalendarData((prev) => ({
              ...prev,
              [dateValue]: result.data as MonthlySchedule,
            }));
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
    }
  };

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-background">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-background p-6">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto">
            <Calendar className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Calendar Error</h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border px-4 sm:px-6 py-4 bg-background">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-primary/10 text-primary">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <h1 className="text-lg sm:text-2xl font-bold text-foreground">
              Academic Calendar
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              View important academic dates and schedules
            </p>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <main className="flex-1 overflow-hidden">
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="h-full flex flex-col"
        >
          <div className="border-b border-border bg-background px-4 sm:px-6 py-3">
            <TabsList className="flex w-full gap-1 bg-background overflow-x-auto hide-scrollbar snap-x snap-mandatory px-1 -mx-1">
              {data.map((item) => (
                <TabsTrigger
                  key={item.dateValue}
                  value={item.dateValue}
                  className="shrink-0 min-w-16 text-xs px-2 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground bg-background hover:bg-muted/50 text-center snap-start"
                >
                  {item.label.split(" ")[0]}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto hide-scrollbar p-6">
            {data.map((item) => (
              <TabsContent
                key={item.dateValue}
                value={item.dateValue}
                className="h-full mt-0"
              >
                {calendarData[item.dateValue] ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold text-foreground">
                        {calendarData[item.dateValue].month}
                      </h2>
                      <div className="text-sm text-muted-foreground">
                        {item.dateValue}
                      </div>
                    </div>

                    {/* Swiper wrapper: enables touch swipe horizontally while hiding native scrollbar */}
                    <Swiper
                      spaceBetween={12}
                      slidesPerView={"auto"}
                      // disable free mode so swiper snaps to whole slides
                      freeMode={false}
                      // group slides automatically by their width so swipes land on full slides
                      slidesPerGroupAuto={true}
                      // remove resistance at edges so content doesn't stretch/bounce
                      resistanceRatio={0}
                      grabCursor={true}
                      className="hide-scrollbar -mx-6 px-6"
                    >
                      <SwiperSlide style={{ width: 1400 }} className="w-350!">
                        <div className="min-w-350 bg-background rounded-lg border border-border p-6">
                          <div className="grid grid-cols-7 gap-1 mb-3">
                            {[
                              "Sun",
                              "Mon",
                              "Tue",
                              "Wed",
                              "Thu",
                              "Fri",
                              "Sat",
                            ].map((day) => (
                              <div
                                key={day}
                                className="p-2 sm:p-3 font-semibold text-center text-muted-foreground text-xs sm:text-sm"
                              >
                                {day}
                              </div>
                            ))}
                          </div>

                          <div className="grid grid-cols-7 gap-1">
                            {createCalendarGrid(
                              calendarData[item.dateValue].month,
                              calendarData[item.dateValue].days,
                            ).map((day, index) => (
                              <div
                                key={index}
                                className={`min-h-16 sm:min-h-25 p-2 sm:p-3 border border-border/50 rounded-md bg-background hover:bg-muted/30 transition-colors ${
                                  day ? "cursor-pointer" : ""
                                }`}
                              >
                                {day && (
                                  <>
                                    <div className="font-semibold text-sm sm:text-sm mb-2 sm:mb-3 text-foreground">
                                      {day.date}
                                    </div>
                                    {day.content.length > 0 && (
                                      <ul className="space-y-1">
                                        {day.content.map((line, lineIndex) => (
                                          <li
                                            key={lineIndex}
                                            className="text-xs text-muted-foreground leading-tight flex items-start gap-1"
                                          >
                                            <span className="text-primary -mt-px">
                                              •
                                            </span>
                                            <span className="flex-1">
                                              {line}
                                            </span>
                                          </li>
                                        ))}
                                      </ul>
                                    )}
                                  </>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </SwiperSlide>
                    </Swiper>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center space-y-3">
                      <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto">
                        <Calendar className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground">
                        Loading calendar...
                      </p>
                    </div>
                  </div>
                )}
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </main>
    </div>
  );
}
