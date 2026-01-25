"use client";

import { useEffect, useState } from "react";
import {
  Course,
  CoursesResponse,
  WeeklyScheduleResponse,
  AttendanceResponse,
} from "../../types/renderer/Course.types";
import { CGPAData } from "../../types/electron/system.types";
import { WeeklySchedule } from "../../types/electron/TimeTable.types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../../components/ui/chart";
import { Button } from "../../components/ui/button";
import { useSemester } from "@/components/useSemester";

/* -------------------- Small Helpers -------------------- */

const Divider = () => <div className="h-px w-full bg-border my-10" />;

const Stat = ({
  label,
  value,
  danger,
}: {
  label: string;
  value: number | string;
  danger?: boolean;
}) => (
  <div className="text-center">
    <p className="text-sm text-muted-foreground">{label}</p>
    <p
      className={`text-3xl font-semibold mt-1 ${
        danger ? "text-red-500" : "text-primary"
      }`}
    >
      {value}
    </p>
  </div>
);

/* -------------------- Dashboard -------------------- */

export default function Dashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [semester, setSemester] = useState("");
  const [cgpaData, setCgpaData] = useState<CGPAData | null>(null);
  const [timetable, setTimetable] = useState<WeeklySchedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getSemester } = useSemester();
  /* -------------------- Chart Data -------------------- */

  const attendanceChartConfig = {
    attendance: {
      label: "Attendance (%)",
      color: "hsl(var(--chart-1))",
    },
  };

  const creditsChartConfig = {
    earned: { label: "Earned", color: "#6366f1" },
    remaining: { label: "Remaining", color: "#94a3b8" },
  };

  const attendanceData = courses.map((c) => ({
    code: c.code,
    attendance: c.attendance,
    fill:
      c.attendance >= 90
        ? "#22c55e"
        : c.attendance >= 75
          ? "#3b82f6"
          : c.attendance >= 65
            ? "#eab308"
            : "#ef4444",
  }));

  const creditsData = cgpaData
    ? [
        {
          name: "Earned",
          value: cgpaData.earnedCredits,
          fill: "#6366f1",
        },
        {
          name: "Remaining",
          value: cgpaData.totalCreditsRequired - cgpaData.earnedCredits,
          fill: "#94a3b8",
        },
      ]
    : [];

  /* -------------------- Today's Classes -------------------- */

  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const today = days[new Date().getDay()];
  const todaysClasses = timetable
    ? timetable[today as keyof WeeklySchedule] || []
    : [];

  /* -------------------- Fetch -------------------- */

  useEffect(() => {
    let cancelled = false;

    const fetchDashboard = async () => {
      try {
        const tokens = await window.auth.getTokens();
        if (!tokens) {
          throw new Error("No auth tokens found");
        }

        const content = await window.content.fetch();
        const cgpa = await window.content.cgpa();
        const timetableResult = await window.timetable.currentSemester();

        if (cancelled) return;

        if (!content?.success) {
          throw new Error(content?.error || "Failed to load courses");
        }

        setCourses(content.courses ?? []);
        setSemester(content.semester ?? "");

        if (cgpa?.success && cgpa.cgpaData) {
          setCgpaData(cgpa.cgpaData);
        }

        if (timetableResult?.success && timetableResult.data) {
          setTimetable(timetableResult.data);
        }
      } catch (e) {
        console.error(e);
        setError(e instanceof Error ? e.message : "Dashboard failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  const testTimetable = async () => {
    try {
      const result: WeeklyScheduleResponse =
        await window.timetable.currentSemester();
      alert(`Timetable fetched: ${result.success ? "Success" : "Failed"}`);
    } catch (e) {
      alert("Error fetching timetable");
    }
  };

  const testCourses = async () => {
    try {
      const result: CoursesResponse = await window.timetable.courses();
      alert(`Courses fetched: ${result.success ? "Success" : "Failed"}`);
    } catch (e) {
      alert("Error fetching courses");
    }
  };

  const testAttendance = async () => {
    try {
      const result: AttendanceResponse = await window.timetable.attendance();
      alert(`Attendance fetched: ${result.success ? "Success" : "Failed"}`);
    } catch (e) {
      alert("Error fetching attendance");
    }
  };

  /* -------------------- States -------------------- */

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full" />
          <span className="text-muted-foreground">Loading dashboard…</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full w-full flex items-center justify-center text-center">
        <div>
          <h2 className="text-xl font-semibold text-red-600">
            Error loading dashboard
          </h2>
          <p className="text-muted-foreground mt-2">{error}</p>
        </div>
      </div>
    );
  }

  /* -------------------- UI -------------------- */

  return (
    <div className="h-full w-full px-6 lg:px-10 py-6 space-y-12">
      {/* Header */}
      <header className="space-y-1">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Academic Dashboard</h1>
            {semester && (
              <p className="text-muted-foreground">Semester: {semester}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button onClick={testCourses} variant="outline">
              Test Courses
            </Button>
            <Button onClick={testTimetable} variant="outline">
              Test Timetable
            </Button>
            <Button onClick={testAttendance} variant="outline">
              Test Attendance
            </Button>
          </div>
        </div>
      </header>

      {/* Today's Classes */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Today&apos;s Classes ({today})</h2>
        {todaysClasses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {todaysClasses.map((cls, index) => (
              <div key={index} className="p-4 border rounded-lg bg-card">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-semibold text-sm">
                    {cls.courseCode}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {cls.slot}
                  </span>
                </div>
                <p className="text-sm mb-1">{cls.courseTitle}</p>
                <p className="text-xs text-muted-foreground mb-2">
                  {cls.courseType}
                </p>
                <div className="flex justify-between text-xs">
                  <span>
                    {cls.startTime} - {cls.endTime}
                  </span>
                  <span>{cls.venue}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {cls.faculty}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">
            No classes scheduled for today.
          </p>
        )}
      </section>

      <Divider />

      {/* Stats */}
      {cgpaData && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-8 gap-x-6">
          <Stat label="Total Credits" value={cgpaData.totalCreditsRequired} />
          <Stat label="Earned Credits" value={cgpaData.earnedCredits} />
          <Stat label="Current CGPA" value={cgpaData.currentCGPA} />
          <Stat label="Non-graded Core" value={cgpaData.nonGradedCore} danger />
        </div>
      )}

      <Divider />

      {/* Attendance Section */}
      <section className="space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <h2 className="text-2xl font-semibold">Course Attendance</h2>
          <p className="text-sm text-muted-foreground">
            Overview of attendance across all enrolled courses
          </p>
        </div>

        <ChartContainer
          config={attendanceChartConfig}
          className="h-[320px] w-full"
        >
          <BarChart data={attendanceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="code" />
            <YAxis domain={[0, 100]} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="attendance" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ChartContainer>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-10 gap-y-4 text-sm">
          {courses.map((c) => (
            <div key={c.index} className="flex justify-between border-b pb-1">
              <span>
                <span className="font-semibold">{c.code}</span> {c.name}
              </span>
              <span
                className={`font-semibold ${
                  c.attendance >= 90
                    ? "text-green-600"
                    : c.attendance >= 75
                      ? "text-blue-600"
                      : c.attendance >= 65
                        ? "text-yellow-600"
                        : "text-red-600"
                }`}
              >
                {c.attendance}%
              </span>
            </div>
          ))}
        </div>
      </section>

      <Divider />

      {/* Credits Section */}
      {cgpaData && (
        <section className="space-y-10">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <h2 className="text-2xl font-semibold">Credits Progress</h2>
            <p className="text-sm text-muted-foreground">
              Track your academic completion status
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* Pie + Legend/Text */}
            <div className="flex flex-col sm:flex-row items-center gap-8 justify-center">
              <ChartContainer
                config={creditsChartConfig}
                className="h-[260px] w-[260px]"
              >
                <PieChart>
                  <Pie
                    data={creditsData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={105}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {creditsData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>

              {/* Text / Legend */}
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-[#6366f1]" />
                  <span>
                    Earned:{" "}
                    <span className="font-semibold text-foreground">
                      {cgpaData.earnedCredits}
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-[#94a3b8]" />
                  <span>
                    Remaining:{" "}
                    <span className="font-semibold text-foreground">
                      {cgpaData.totalCreditsRequired - cgpaData.earnedCredits}
                    </span>
                  </span>
                </div>
                <p className="pt-2">
                  Total required credits:{" "}
                  <span className="font-semibold text-foreground">
                    {cgpaData.totalCreditsRequired}
                  </span>
                </p>
              </div>
            </div>

            {/* Supporting Stats */}
            <div className="grid grid-cols-2 gap-8">
              <Stat label="Earned" value={cgpaData.earnedCredits} />
              <Stat
                label="Remaining"
                value={cgpaData.totalCreditsRequired - cgpaData.earnedCredits}
              />
              <Stat label="Current CGPA" value={cgpaData.currentCGPA} />
              <Stat
                label="Non-graded Core"
                value={cgpaData.nonGradedCore}
                danger
              />
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
