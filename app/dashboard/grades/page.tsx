"use client";

import { useEffect, useState } from "react";
import type { StudentHistoryData } from "../../../lib/electron/parsers/grade.htmlparser";
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
} from "@/components/ui/chart";

/* -------------------- Helpers -------------------- */

const Divider = () => <div className="h-px w-full bg-border my-10" />;

const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) => (
  <div className="flex justify-between border-b py-2 text-sm">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-medium">{value}</span>
  </div>
);

/* -------------------- Page -------------------- */

export default function GradePage() {
  const [gradeData, setGradeData] = useState<StudentHistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const result = await window.grade.getExamGradeView();
        if (result.success) {
          setGradeData(result.data ?? null);
        } else {
          setError(result.error || "Failed to fetch grades");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchGrades();
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary" />
          <span className="text-muted-foreground">Loading grades…</span>
        </div>
      </div>
    );
  }

  if (error || !gradeData) {
    return (
      <div className="h-full flex items-center justify-center text-center">
        <p className="text-destructive">{error || "No data available"}</p>
      </div>
    );
  }

  /* -------------------- Charts -------------------- */

  const gradeDistributionData = Object.entries(
    gradeData.cgpa.gradeDistribution,
  ).map(([grade, count]) => ({
    grade: grade.toUpperCase(),
    count,
  }));

  const creditsBarData = gradeData.curriculum.details.map((d) => ({
    category: d.category,
    earned: d.creditsEarned,
    required: d.creditsRequired,
  }));

  /* -------------------- UI -------------------- */

  return (
    <div className="h-full w-full px-6 lg:px-10 py-6 space-y-14">
      {/* ================= HEADER ================= */}
      <header className="space-y-1">
        <h1 className="text-3xl font-bold">Academic Performance</h1>
        <p className="text-muted-foreground">
          Detailed grade & curriculum analysis
        </p>
      </header>

      {/* ================= PROFILE ================= */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Student Profile</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-3">
          <InfoRow label="Name" value={gradeData.profile.name} />
          <InfoRow label="Register Number" value={gradeData.profile.regNo} />
          <InfoRow label="Programme" value={gradeData.profile.programme} />
          <InfoRow label="Gender" value={gradeData.profile.gender} />
          <InfoRow label="Year Joined" value={gradeData.profile.yearJoined} />
          <InfoRow label="School" value={gradeData.profile.school} />
          <InfoRow label="Campus" value={gradeData.profile.campus} />
        </div>
      </section>

      <Divider />

      {/* ================= CGPA OVERVIEW ================= */}
      <section className="space-y-8">
        <h2 className="text-2xl font-semibold">CGPA Overview</h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-center">
          {/* CGPA */}
          <div className="text-center space-y-1">
            <p className="text-muted-foreground">Current CGPA</p>
            <p className="text-4xl font-bold text-primary">
              {gradeData.cgpa.cgpa}
            </p>
          </div>

          {/* Credits */}
          <div className="space-y-3">
            <InfoRow
              label="Credits Earned"
              value={gradeData.cgpa.creditsEarned}
            />
            <InfoRow
              label="Credits Registered"
              value={gradeData.cgpa.creditsRegistered}
            />
          </div>

          {/* Grade Pie */}
          <ChartContainer
            config={{ count: { label: "Count" } }}
            className="h-[260px]"
          >
            <PieChart>
              <Pie
                data={gradeDistributionData}
                dataKey="count"
                nameKey="grade"
                innerRadius={60}
                outerRadius={100}
              >
                {gradeDistributionData.map((_, i) => (
                  <Cell key={i} fill={`var(--chart-${(i % 5) + 1})`} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
            </PieChart>
          </ChartContainer>
        </div>
      </section>

      <Divider />

      {/* ================= CURRICULUM ================= */}
      <section className="space-y-8">
        <h2 className="text-2xl font-semibold">Curriculum Progress</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Summary */}
          <div className="space-y-3">
            <InfoRow
              label="Total Credits Required"
              value={gradeData.curriculum.summary.totalRequired}
            />
            <InfoRow
              label="Total Credits Earned"
              value={gradeData.curriculum.summary.totalEarned}
            />
          </div>

          {/* Credits Chart */}
          <ChartContainer
            config={{
              earned: { label: "Earned" },
              required: { label: "Required" },
            }}
            className="h-[260px]"
          >
            <BarChart data={creditsBarData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="earned"
                fill="var(--chart-1)"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="required"
                fill="var(--chart-2)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </div>
      </section>

      <Divider />

      {/* ================= GRADE TABLE ================= */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Grade History</h2>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border-collapse">
            <thead>
              <tr className="border-b bg-muted">
                {[
                  "Sl",
                  "Code",
                  "Title",
                  "Type",
                  "Credits",
                  "Grade",
                  "Exam",
                  "Result",
                  "Distribution",
                ].map((h) => (
                  <th key={h} className="px-3 py-3 text-left font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {gradeData.grades.map((g, i) => (
                <tr key={i} className="border-b hover:bg-muted/50">
                  <td className="px-3 py-2">{g.slNo}</td>
                  <td className="px-3 py-2 font-mono">{g.courseCode}</td>
                  <td className="px-3 py-2">{g.courseTitle}</td>
                  <td className="px-3 py-2">{g.courseType}</td>
                  <td className="px-3 py-2 text-center">{g.credits}</td>
                  <td className="px-3 py-2 font-bold">{g.grade}</td>
                  <td className="px-3 py-2">{g.examMonth}</td>
                  <td className="px-3 py-2">{g.resultDeclared}</td>
                  <td className="px-3 py-2">{g.courseDistribution}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
