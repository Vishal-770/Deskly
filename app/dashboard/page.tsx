"use client";
import { useEffect, useState } from "react";

interface Course {
  index: number;
  code: string;
  name: string;
  type: string;
  attendance: number;
  remark: string;
}

interface CGPAData {
  totalCreditsRequired: number;
  earnedCredits: number;
  currentCGPA: number;
  nonGradedCore: number;
}

export default function Dashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [semester, setSemester] = useState("");
  const [cgpaData, setCgpaData] = useState<CGPAData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!window?.system) return;

        const cookies = sessionStorage.getItem("vtp_cookies");
        const authorizedID = sessionStorage.getItem("vtp_authorizedID");
        const csrf = sessionStorage.getItem("vtp_csrf");

        if (!cookies) return;

        const content = await window.system.getContent(
          cookies,
          authorizedID || undefined,
          csrf || undefined,
        );

        if (content?.success) {
          setCourses(content.courses ?? []);
          setSemester(content.semester ?? "");
        }

        const cgpa = await window.system.getCGPA(
          cookies,
          authorizedID || undefined,
          csrf || undefined,
        );

        if (cgpa?.success && cgpa.cgpaData) {
          setCgpaData(cgpa.cgpaData);
        }
      } catch (e) {
        console.error("Dashboard error:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center bg-background mt-10">
        <div className="text-center space-y-3">
          <div className="animate-spin h-10 w-10 border-b-2 border-primary rounded-full mx-auto" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background px-6 py-4 mt-10">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-1">
          <h1 className="text-3xl font-bold">Academic Dashboard</h1>
          {semester && (
            <p className="text-muted-foreground">Semester: {semester}</p>
          )}
        </div>

        {/* Course Details */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-center">
            Course Details
          </h2>

          <div className="overflow-x-auto hide-scrollbar">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-2">#</th>
                  <th className="py-2 text-left">Code - Course</th>
                  <th className="py-2">Type</th>
                  <th className="py-2">Attendance</th>
                  <th className="py-2 text-left">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((c) => (
                  <tr
                    key={c.index}
                    className="border-b last:border-0 hover:bg-muted/40"
                  >
                    <td className="py-2 text-center">{c.index}</td>
                    <td className="py-2">
                      <span className="font-bold">{c.code}</span>{" "}
                      <span className="text-muted-foreground">{c.name}</span>
                    </td>
                    <td className="py-2 text-center">
                      <span className="px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
                        {c.type}
                      </span>
                    </td>
                    <td
                      className={`py-2 text-center font-bold ${
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
                    </td>
                    <td className="py-2">{c.remark || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Academic Summary */}
        {cgpaData && (
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-center">
              Academic Summary
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
        )}
      </div>
    </div>
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
