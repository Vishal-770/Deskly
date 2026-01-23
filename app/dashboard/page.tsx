"use client";
import { useEffect, useState } from "react";
import { Course } from "../../types/renderer/Course.types";
import { CGPAData } from "../../types/electron/system.types";
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

export default function Dashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [semester, setSemester] = useState("");
  const [cgpaData, setCgpaData] = useState<CGPAData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const attendanceChartConfig = {
    attendance: {
      label: "Attendance (%)",
      color: "hsl(var(--chart-1))",
    },
  };

  const creditsChartConfig = {
    earned: {
      label: "Earned Credits",
      color: "hsl(var(--chart-2))",
    },
    remaining: {
      label: "Remaining Credits",
      color: "hsl(var(--chart-3))",
    },
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
          fill: "hsl(var(--chart-2))",
        },
        {
          name: "Remaining",
          value: cgpaData.totalCreditsRequired - cgpaData.earnedCredits,
          fill: "hsl(var(--chart-3))",
        },
      ]
    : [];

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!window?.content) {
          setError("Content API not available");
          return;
        }

        const cookies = sessionStorage.getItem("vtp_cookies");
        const authorizedID = sessionStorage.getItem("vtp_authorizedID");
        const csrf = sessionStorage.getItem("vtp_csrf");
        console.log("Fetching dashboard with cookies:", cookies);
        if (!cookies) {
          setError("No authentication cookies found. Please log in.");
          return;
        }

        const content = await window.content.fetch(
          cookies,
          authorizedID || undefined,
          csrf || undefined,
        );

        if (content?.success) {
          setCourses(content.courses ?? []);
          setSemester(content.semester ?? "");
        } else {
          setError(content?.error || "Failed to fetch course content");
        }

        const cgpa = await window.content.cgpa(
          cookies,
          authorizedID || undefined,
          csrf || undefined,
        );

        if (cgpa?.success && cgpa.cgpaData) {
          setCgpaData(cgpa.cgpaData);
        } else if (cgpa && !cgpa.success) {
          setError(cgpa?.error || "Failed to fetch CGPA data");
        }
      } catch (e) {
        console.error("Dashboard error:", e);
        setError(
          e instanceof Error ? e.message : "An unexpected error occurred",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center bg-background mt-10 min-h-screen">
        <div className="text-center space-y-3">
          <div className="animate-spin h-10 w-10 border-b-2 border-primary rounded-full mx-auto" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center bg-background mt-10 min-h-screen">
        <div className="text-center space-y-3">
          <div className="text-red-600 text-lg font-semibold">Error</div>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="text-center space-y-1">
        <h1 className="text-3xl font-bold">Academic Dashboard</h1>
        {semester && (
          <p className="text-muted-foreground">Semester: {semester}</p>
        )}
      </div>

      {/* Course Attendance Chart */}
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4 text-center">
          Course Attendance
        </h2>
        <ChartContainer config={attendanceChartConfig} className="h-[300px]">
          <BarChart data={attendanceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="code" />
            <YAxis domain={[0, 100]} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="attendance" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
        <div className="mt-4 space-y-2 max-h-40 overflow-y-auto">
          {courses.map((c) => (
            <div
              key={c.index}
              className="flex justify-between items-center text-sm"
            >
              <span>
                <span className="font-bold">{c.code}</span> - {c.name}
              </span>
              <span
                className={`font-bold ${
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
      </div>

      {/* Academic Summary */}
      {cgpaData && (
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-center">
            Academic Summary
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Credits Pie Chart */}
            <div className="flex flex-col items-center">
              <h3 className="text-lg font-medium mb-2">Credits Overview</h3>
              <ChartContainer config={creditsChartConfig} className="h-[200px]">
                <PieChart>
                  <Pie
                    data={creditsData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {creditsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
              <div className="mt-2 text-sm text-muted-foreground">
                Earned: {cgpaData.earnedCredits} / Total:{" "}
                {cgpaData.totalCreditsRequired}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Stat
                label="Total Credits"
                value={cgpaData.totalCreditsRequired}
              />
              <Stat label="Earned Credits" value={cgpaData.earnedCredits} />
              <Stat label="Current CGPA" value={cgpaData.currentCGPA} />
              <Stat
                label="Non-graded Core"
                value={cgpaData.nonGradedCore}
                danger
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Stat({
  label,
  value,
  danger,
}: {
  label: string;
  value: number;
  danger?: boolean;
}) {
  return (
    <div
      className={`p-4 rounded-lg text-center ${
        danger ? "bg-red-100 text-red-600" : "bg-primary/10 text-primary"
      }`}
    >
      <p className="text-sm opacity-80">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
