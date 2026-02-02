"use client";

import Loader from "@/components/Loader";
import { ErrorDisplay } from "@/components/error-display";
import { useEffect, useState } from "react";
import { AttendanceRecord as DetailRecord } from "@/types/renderer/AttendanceDetail.types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

/* -------------------- Global Types -------------------- */

declare global {
  interface Window {
    attendanceDetail?: {
      get: (
        classId: string,
        slotName: string,
      ) => Promise<{
        success: boolean;
        data?: import("@/types/renderer/AttendanceDetail.types").AttendanceRecord[];
        error?: string;
      }>;
    };
  }
}

/* -------------------- Types -------------------- */

interface Faculty {
  name: string;
}

interface AttendanceRecord {
  classId: string;
  courseCode: string;
  courseTitle: string;
  courseType: string;
  slot: string;
  faculty: Faculty;
  attendedClasses: number;
  totalClasses: number;
  attendancePercentage: number;
  status: string;
}

/* -------------------- Utility Functions -------------------- */

function calculateHoursFromTimeRange(timeRange: string): number {
  // Parse time range like "TUE,08:00-09:40" or "14:55-15:45"
  const timePart = timeRange.includes(",")
    ? timeRange.split(",")[1]
    : timeRange;
  const match = timePart.match(/(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})/);
  if (!match) return 0;

  const [, startHour, startMin, endHour, endMin] = match.map(Number);

  const startTime = startHour * 60 + startMin;
  const endTime = endHour * 60 + endMin;

  const durationMinutes = endTime - startTime;
  return durationMinutes / 60; // Convert to hours
}

function formatDayAndTime(dayAndTime: string): string {
  const dayMap: { [key: string]: string } = {
    MON: "Monday",
    TUE: "Tuesday",
    WED: "Wednesday",
    THU: "Thursday",
    FRI: "Friday",
    SAT: "Saturday",
    SUN: "Sunday",
  };

  if (dayAndTime.includes(",")) {
    const [day, time] = dayAndTime.split(",");
    const fullDay = dayMap[day] || day;
    return `${fullDay} ${time.replace("-", " - ")}`;
  }
  return dayAndTime.replace("-", " - ");
}

/* -------------------- Mock Data -------------------- */

/* -------------------- Components -------------------- */

function CircularProgress({
  percentage,
  size = 56,
}: {
  percentage: number;
  size?: number;
}) {
  const colors =
    percentage >= 75
      ? { progress: "text-green-500", text: "text-foreground" }
      : percentage >= 60
        ? { progress: "text-yellow-500", text: "text-yellow-500" }
        : { progress: "text-destructive", text: "text-destructive" };
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-secondary"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={colors.progress}
          style={{ transition: "stroke-dashoffset 0.5s ease-in-out" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-xs font-semibold ${colors.text}`}>
          {percentage}%
        </span>
      </div>
    </div>
  );
}

function calculateAttendanceNeeded(
  attended: number,
  total: number,
  minPercentage = 75,
) {
  const currentPercentage = (attended / total) * 100;

  if (currentPercentage >= minPercentage) {
    // Calculate how many classes can be skipped while staying at 75%
    // Formula: (attended) / (total + x) >= 0.75
    // attended >= 0.75 * (total + x)
    // attended / 0.75 >= total + x
    // x <= (attended / 0.75) - total
    const canSkip = Math.floor(attended / (minPercentage / 100) - total);
    return { canSkip: Math.max(0, canSkip), needToAttend: 0, isSafe: true };
  } else {
    // Calculate how many consecutive classes need to be attended to reach 75%
    // Formula: (attended + x) / (total + x) >= 0.75
    // attended + x >= 0.75 * total + 0.75 * x
    // 0.25 * x >= 0.75 * total - attended
    // x >= (0.75 * total - attended) / 0.25
    // x >= 3 * total - 4 * attended
    const needToAttend =
      Math.ceil((minPercentage / 100) * total - attended) /
      (1 - minPercentage / 100);
    const actualNeed = Math.ceil(3 * total - 4 * attended);
    return { canSkip: 0, needToAttend: Math.max(0, actualNeed), isSafe: false };
  }
}

function AttendanceRow({
  record,
  details,
}: {
  record: AttendanceRecord;
  details: DetailRecord[] | null;
}) {
  const attendanceStatus = calculateAttendanceNeeded(
    record.attendedClasses,
    record.totalClasses,
  );
  let badgeClass = "bg-green-500/15 text-green-500";
  let hintColor = "text-green-500";
  let mobileColor = "text-green-500";
  if (record.attendancePercentage < 60) {
    badgeClass = "bg-destructive/15 text-destructive";
    hintColor = "text-destructive";
    mobileColor = "text-destructive";
  } else if (record.attendancePercentage < 75) {
    badgeClass = "bg-yellow-500/15 text-yellow-500";
    hintColor = "text-yellow-500";
    mobileColor = "text-yellow-500";
  }

  return (
    <AccordionItem value={record.classId}>
      <AccordionTrigger className="group relative flex items-center justify-between py-5 px-6 hover:bg-secondary/30 transition-colors duration-200 cursor-default hover:no-underline">
        <div className="flex items-center gap-6 flex-1 min-w-0">
          <CircularProgress percentage={record.attendancePercentage} />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-xs font-mono text-muted-foreground tracking-wider">
                {record.courseCode}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                {record.courseType}
              </span>
            </div>
            <div className="min-w-0">
              <h3 className="text-foreground font-medium truncate pr-4">
                {record.courseTitle}
              </h3>
              {/* Attendance hint */}
              <p className={`text-xs mt-1 ${hintColor}`}>
                {attendanceStatus.isSafe
                  ? attendanceStatus.canSkip > 0
                    ? `Can skip ${attendanceStatus.canSkip} class${attendanceStatus.canSkip > 1 ? "es" : ""}`
                    : "On track - attend next class"
                  : `Need ${attendanceStatus.needToAttend} more class${attendanceStatus.needToAttend > 1 ? "es" : ""} to reach 75%`}
              </p>
            </div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm">
          <div className="text-right w-24">
            <p className="text-muted-foreground text-xs mb-0.5">Slot</p>
            <p className="font-mono text-foreground">{record.slot}</p>
          </div>

          <div className="text-right w-32">
            <p className="text-muted-foreground text-xs mb-0.5">Faculty</p>
            <p className="text-foreground truncate">{record.faculty.name}</p>
          </div>

          <div className="text-right w-20">
            <p className="text-muted-foreground text-xs mb-0.5">Classes</p>
            <p className="font-mono text-foreground">
              {record.attendedClasses}
              <span className="text-muted-foreground">
                /{record.totalClasses}
              </span>
            </p>
          </div>

          <div className="w-28 text-right">
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full ${badgeClass}`}
            >
              {attendanceStatus.isSafe
                ? attendanceStatus.canSkip > 0
                  ? `+${attendanceStatus.canSkip} skip`
                  : "Safe"
                : `-${attendanceStatus.needToAttend} need`}
            </span>
          </div>
        </div>

        {/* Mobile view details */}
        <div className="md:hidden flex items-center gap-4">
          <div className="text-right">
            <p className="font-mono text-sm text-foreground">
              {record.attendedClasses}/{record.totalClasses}
            </p>
            <span className={`text-xs ${mobileColor}`}>
              {attendanceStatus.isSafe
                ? `+${attendanceStatus.canSkip} skip`
                : `-${attendanceStatus.needToAttend} need`}
            </span>
          </div>
        </div>
      </AccordionTrigger>
      {details && (
        <AccordionContent className="bg-secondary/20 border-t border-border/50 overflow-hidden">
          <div className="px-6 py-4 animate-in slide-in-from-top-2 duration-300">
            <div className="mb-3">
              <h4 className="text-sm font-medium text-foreground">
                Attendance History
              </h4>
            </div>
            {/* Headers */}
            <div className="grid grid-cols-4 md:grid-cols-6 gap-3 mb-2 text-xs font-medium text-muted-foreground px-3">
              <span>S.No</span>
              <span>Date</span>
              <span className="hidden md:block">Slot</span>
              <span>Time</span>
              <span className="hidden md:block">Hours</span>
              <span className="text-right">Status</span>
            </div>
            <div
              className="space-y-2 max-h-60 overflow-y-auto"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {details.map((detail, index) => (
                <div
                  key={index}
                  className="grid grid-cols-4 md:grid-cols-6 gap-3 items-center py-2 px-3 bg-background/50 rounded-md text-xs animate-in fade-in duration-300"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <span className="font-mono text-muted-foreground">
                    {detail.serialNo}
                  </span>
                  <span className="text-foreground">{detail.date}</span>
                  <span className="hidden md:block text-muted-foreground">
                    {detail.slot}
                  </span>
                  <span className="text-muted-foreground">
                    {formatDayAndTime(detail.dayAndTime)}
                  </span>
                  <span className="hidden md:block text-muted-foreground">
                    {detail.status === "Present" || detail.status === "On Duty"
                      ? (() => {
                          const decimalHours = calculateHoursFromTimeRange(
                            detail.dayAndTime,
                          );
                          const hours = Math.floor(decimalHours);
                          const minutes = Math.round(
                            (decimalHours - hours) * 60,
                          );
                          return `${hours}h ${minutes}m`;
                        })()
                      : "-"}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium justify-self-end ${
                      detail.status === "Present"
                        ? "bg-green-500/15 text-green-500"
                        : detail.status === "Absent"
                          ? "bg-destructive/15 text-destructive"
                          : "bg-yellow-500/15 text-yellow-500"
                    }`}
                  >
                    {detail.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </AccordionContent>
      )}
    </AccordionItem>
  );
}

function StatsOverview({
  data,
  expandedDetails,
}: {
  data: AttendanceRecord[];
  expandedDetails: { [key: string]: DetailRecord[] | null };
}) {
  const totalClasses = data.reduce((sum, r) => sum + r.totalClasses, 0);
  const attendedClasses = data.reduce((sum, r) => sum + r.attendedClasses, 0);
  const overallPercentage = Math.round((attendedClasses / totalClasses) * 100);
  const lowAttendance = data.filter((r) => r.attendancePercentage < 60).length;

  // Calculate total On Duty hours across all subjects based on actual time
  const totalODHours = Object.values(expandedDetails).reduce(
    (total, details) => {
      if (!details) return total;
      return (
        total +
        details
          .filter((detail) => detail.status === "On Duty")
          .reduce(
            (sum, detail) =>
              sum + calculateHoursFromTimeRange(detail.dayAndTime),
            0,
          )
      );
    },
    0,
  );

  return (
    <div className="flex flex-col md:flex-row items-center gap-6 md:gap-12 py-8 px-6">
      <div className="flex items-center gap-4">
        <CircularProgress percentage={overallPercentage} size={72} />
        <div>
          <p className="text-3xl font-semibold text-foreground tracking-tight">
            {overallPercentage}%
          </p>
          <p className="text-sm text-muted-foreground">Overall Attendance</p>
        </div>
      </div>

      <div className="hidden md:block h-12 w-px bg-border" />

      <div className="grid grid-cols-2 md:flex gap-4 md:gap-10 md:justify-start">
        <div>
          <p className="text-2xl font-semibold text-foreground font-mono">
            {data.length}
          </p>
          <p className="text-sm text-muted-foreground">Courses</p>
        </div>

        <div>
          <p className="text-2xl font-semibold text-foreground font-mono">
            {attendedClasses}
            <span className="text-muted-foreground text-lg">
              /{totalClasses}
            </span>
          </p>
          <p className="text-sm text-muted-foreground">Classes Attended</p>
        </div>

        {totalODHours > 0 && (
          <div>
            <p className="text-2xl font-semibold text-foreground font-mono">
              {(() => {
                const totalHours = Math.floor(totalODHours);
                const totalMinutes = Math.round(
                  (totalODHours - totalHours) * 60,
                );
                return `${totalHours}h ${totalMinutes}m`;
              })()}
            </p>
            <p className="text-sm text-muted-foreground">On Duty Hours</p>
          </div>
        )}

        {lowAttendance > 0 && (
          <div>
            <p className="text-2xl font-semibold text-destructive font-mono">
              {lowAttendance}
            </p>
            <p className="text-sm text-muted-foreground">Need Attention</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* -------------------- Page -------------------- */

export default function AttendancePage() {
  const [attendanceData, setAttendanceData] = useState<
    AttendanceRecord[] | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedDetails, setExpandedDetails] = useState<{
    [key: string]: DetailRecord[] | null;
  }>({});

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        // Check if running in Electron context
        if (
          typeof window !== "undefined" &&
          "attendance" in window &&
          window.attendance
        ) {
          const result = await (
            window as {
              attendance: {
                get: () => Promise<{
                  success: boolean;
                  data?: AttendanceRecord[];
                  error?: string;
                }>;
              };
            }
          ).attendance.get();
          if (result.success) {
            setAttendanceData(result.data ?? null);
            // Fetch all details
            if (result.data && result.data.length > 0) {
              const fetchAllDetails = async () => {
                const allDetails: { [key: string]: DetailRecord[] } = {};
                const attendanceDetail = window.attendanceDetail;
                if (attendanceDetail) {
                  for (const record of result.data!) {
                    try {
                      const detailResult = await attendanceDetail.get(
                        record.classId,
                        record.slot,
                      );
                      if (detailResult.success && detailResult.data) {
                        allDetails[record.classId] = detailResult.data;
                      }
                    } catch (err) {
                      console.error(
                        "Error fetching details for",
                        record.classId,
                        err,
                      );
                    }
                  }
                }
                setExpandedDetails(allDetails);
              };
              fetchAllDetails();
            }
          } else {
            setError(result.error || "Failed to fetch attendance");
          }
        } else {
          // No data available
          setAttendanceData([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <ErrorDisplay
        title="Failed to load attendance"
        message={error}
        onRetry={() => window.location.reload()}
        retryLabel="Reload Page"
      />
    );
  }

  if (!attendanceData || attendanceData.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-6 h-6 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <p className="text-foreground font-medium">No Data</p>
          <p className="text-sm text-muted-foreground mt-1">
            No attendance records found
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Title Section */}
        <div className="mb-2">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Attendance
          </h1>
          <p className="text-muted-foreground mt-2">
            Current semester overview
          </p>
        </div>

        {/* Stats Overview */}
        <StatsOverview
          data={attendanceData}
          expandedDetails={expandedDetails}
        />

        {/* Divider */}
        <div className="h-px bg-border my-6" />

        {/* Course List */}
        <Accordion type="multiple" className="rounded-lg overflow-hidden">
          {attendanceData.map((record) => (
            <AttendanceRow
              key={record.classId}
              record={record}
              details={expandedDetails[record.classId] || null}
            />
          ))}
        </Accordion>
      </div>
    </div>
  );
}
