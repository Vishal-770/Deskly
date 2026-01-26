"use client";

import Loader from "@/components/Loader";
import { useEffect, useState } from "react";
import { AttendanceRecord as DetailRecord } from "@/types/renderer/AttendanceDetail.types";

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

function calculateTotalODHours(details: DetailRecord[]): number {
  return details
    .filter(
      (detail) =>
        detail.status === "Present" ||
        detail.status === "On Duty" ||
        detail.status === "Absent",
    )
    .reduce(
      (total, detail) => total + calculateHoursFromTimeRange(detail.dayAndTime),
      0,
    );
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
  onToggleExpanded,
  details,
  isExpanded,
}: {
  record: AttendanceRecord;
  onToggleExpanded: (classId: string) => void;
  details: DetailRecord[] | null;
  isExpanded: boolean;
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
    <div className="group relative">
      <div className="flex items-center justify-between py-5 px-6 hover:bg-secondary/30 transition-colors duration-200 cursor-default">
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
          <div className="w-20 text-right">
            <button
              onClick={() => onToggleExpanded(record.classId)}
              className="text-xs px-2 py-1 bg-primary text-primary-foreground rounded hover:bg-primary/90 flex items-center gap-1"
            >
              <svg
                className={`h-3 w-3 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
              {isExpanded ? "Hide" : "Details"}
            </button>
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
      </div>

      {/* Subtle divider */}
      <div className="absolute bottom-0 left-6 right-6 h-px bg-border/50" />

      {/* Collapsible Details Section */}
      {isExpanded && details && (
        <div className="bg-secondary/20 border-t border-border/50 overflow-hidden">
          <div className="px-6 py-4 animate-in slide-in-from-top-2 duration-300">
            <div className="mb-3">
              <h4 className="text-sm font-medium text-foreground">
                Attendance History
              </h4>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {details.map((detail, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 px-3 bg-background/50 rounded-md text-xs animate-in fade-in duration-300"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-muted-foreground w-8">
                      {detail.serialNo}
                    </span>
                    <span className="text-foreground">{detail.date}</span>
                    <span className="text-muted-foreground">{detail.slot}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground">
                      {detail.dayAndTime}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      (
                      {detail.status === "Present" ||
                      detail.status === "On Duty"
                        ? `${calculateHoursFromTimeRange(detail.dayAndTime).toFixed(1)}h`
                        : "-"}
                      )
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
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
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
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

  // Calculate total On Duty hours across all subjects (50 min per OD)
  const totalODHours = Object.values(expandedDetails).reduce(
    (total, details) => {
      if (!details) return total;
      const odCount = details.filter(
        (detail) => detail.status === "On Duty",
      ).length;
      return total + (odCount * 50) / 60;
    },
    0,
  );

  return (
    <div className="flex items-center gap-12 py-8 px-6">
      <div className="flex items-center gap-4">
        <CircularProgress percentage={overallPercentage} size={72} />
        <div>
          <p className="text-3xl font-semibold text-foreground tracking-tight">
            {overallPercentage}%
          </p>
          <p className="text-sm text-muted-foreground">Overall Attendance</p>
        </div>
      </div>

      <div className="h-12 w-px bg-border" />

      <div className="flex gap-10">
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
              {totalODHours.toFixed(1)}h
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
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleExpanded = (classId: string) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(classId)) {
        newSet.delete(classId);
      } else {
        newSet.add(classId);
      }
      return newSet;
    });
  };

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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-destructive/15 flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-6 h-6 text-destructive"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <p className="text-destructive font-medium">Error</p>
          <p className="text-sm text-muted-foreground mt-1">{error}</p>
        </div>
      </div>
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

        {/* Course List Header */}
        <div className="flex items-center justify-between px-6 py-3 text-xs text-muted-foreground uppercase tracking-wider">
          <span>Course</span>
          <div className="hidden md:flex items-center gap-8">
            <span className="w-24 text-right">Slot</span>
            <span className="w-32 text-right">Faculty</span>
            <span className="w-20 text-right">Classes</span>
            <span className="w-28 text-right">Margin</span>
            <span className="w-20 text-right">Actions</span>
          </div>
        </div>

        {/* Course List */}
        <div className="rounded-lg overflow-hidden">
          {attendanceData.map((record) => (
            <AttendanceRow
              key={record.classId}
              record={record}
              onToggleExpanded={toggleExpanded}
              details={expandedDetails[record.classId] || null}
              isExpanded={expandedRows.has(record.classId)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
