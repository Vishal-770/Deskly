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
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Search, ChevronDown } from "lucide-react";
import Loader from "@/components/Loader";

/* -------------------- Helper Components -------------------- */

const GradeBadge = ({ grade }: { grade: string }) => {
  const colors: Record<string, string> = {
    S: "text-[oklch(0.75_0.15_200)]",
    A: "text-[oklch(0.8_0.15_145)]",
    B: "text-[oklch(0.85_0.12_85)]",
    C: "text-[oklch(0.8_0.15_60)]",
    D: "text-[oklch(0.75_0.2_30)]",
    F: "text-[oklch(0.65_0.2_25)]",
  };
  return (
    <span
      className={`font-bold text-base ${colors[grade] || "text-muted-foreground"}`}
    >
      {grade}
    </span>
  );
};

/* -------------------- Page -------------------- */

export default function GradePage() {
  const [gradeData, setGradeData] = useState<StudentHistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

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
    return <Loader />;
  }

  if (error || !gradeData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-sm text-destructive">
          {error || "No data available"}
        </p>
      </div>
    );
  }

  /* Chart Data */
  const gradeDistributionData = Object.entries(gradeData.cgpa.gradeDistribution)
    .filter(([, count]) => count > 0)
    .map(([grade, count]) => ({ grade, count }));

  const creditsBarData = gradeData.curriculum.details.map((d) => ({
    category: d.category,
    earned: d.creditsEarned,
    required: d.creditsRequired,
  }));

  const completionPct = Math.round(
    (gradeData.curriculum.summary.totalEarned /
      gradeData.curriculum.summary.totalRequired) *
      100,
  );

  const filteredGrades = gradeData.grades.filter((g) => {
    const matchSearch =
      g.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.courseTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchFilter =
      filterType === "all" ||
      g.courseType.toLowerCase() === filterType.toLowerCase();
    return matchSearch && matchFilter;
  });

  const courseTypes = [
    "all",
    ...Array.from(new Set(gradeData.grades.map((g) => g.courseType))),
  ];

  const CHART_COLORS = [
    "oklch(0.7 0.15 200)",
    "oklch(0.75 0.15 145)",
    "oklch(0.8 0.12 85)",
    "oklch(0.75 0.15 60)",
    "oklch(0.7 0.2 30)",
  ];

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <header className="space-y-2 mb-8 sm:mb-10">
        <h1 className="text-2xl sm:text-3xl font-bold">Academic Performance</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Detailed grade & curriculum analysis
        </p>
      </header>

      {/* Hero Stats */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 sm:gap-8 mb-8 sm:mb-10">
        <div className="flex items-baseline gap-3">
          <span className="text-5xl sm:text-6xl font-bold text-primary tracking-tight">
            {gradeData.cgpa.cgpa.toFixed(2)}
          </span>
          <span className="text-base sm:text-lg text-muted-foreground">
            CGPA
          </span>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-10 text-sm">
          <div>
            <span className="text-xl sm:text-2xl font-semibold text-foreground">
              {gradeData.cgpa.creditsEarned}
            </span>
            <span className="text-muted-foreground ml-1">
              / {gradeData.cgpa.creditsRegistered} credits
            </span>
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-semibold text-foreground">
              {completionPct}%
            </span>
            <span className="text-muted-foreground ml-1">complete</span>
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-semibold text-foreground">
              {gradeData.grades.length}
            </span>
            <span className="text-muted-foreground ml-1">courses</span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-border mb-6 sm:mb-8" />

      {/* Charts Row */}
      <div className="space-y-6 sm:space-y-8 mb-8 sm:mb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
          {/* Grade Distribution */}
          <div>
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">
              Grade Distribution
            </h3>
            <div className="h-[160px] sm:h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={gradeDistributionData}
                    dataKey="count"
                    nameKey="grade"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    strokeWidth={0}
                  >
                    {gradeDistributionData.map((_, i) => (
                      <Cell
                        key={`cell-${i}`}
                        fill={CHART_COLORS[i % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: 6,
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-2">
              {gradeDistributionData.map((d, i) => (
                <div key={d.grade} className="flex items-center gap-1.5">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
                    }}
                  />
                  <span className="text-xs text-muted-foreground">
                    {d.grade}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Credits by Category */}
          <div>
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">
              Credits by Category
            </h3>
            <div className="h-[160px] sm:h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={creditsBarData} barGap={2}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="category"
                    tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                    width={30}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: 6,
                      fontSize: 12,
                    }}
                  />
                  <Bar
                    dataKey="earned"
                    fill={CHART_COLORS[0]}
                    radius={[3, 3, 0, 0]}
                  />
                  <Bar
                    dataKey="required"
                    fill="var(--muted)"
                    radius={[3, 3, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Curriculum Progress */}
        <div>
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">
            Curriculum Progress
          </h3>
          <div className="space-y-4">
            {gradeData.curriculum.details.map((d) => {
              const pct = Math.round(
                (d.creditsEarned / d.creditsRequired) * 100,
              );
              return (
                <div key={d.category}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground">{d.category}</span>
                    <span className="text-foreground font-medium">
                      {d.creditsEarned}/{d.creditsRequired}
                    </span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-5 pt-4 border-t border-border flex justify-between text-xs">
            <span className="text-muted-foreground">Total</span>
            <span className="text-foreground font-medium">
              {gradeData.curriculum.summary.totalEarned}/
              {gradeData.curriculum.summary.totalRequired}
            </span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-border mb-4 sm:mb-6" />

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Grade History
        </h3>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-44 h-8 pl-8 pr-3 text-xs bg-secondary border-0 rounded-md focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
            />
          </div>
          <div className="relative">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="h-8 pl-3 pr-7 text-xs bg-secondary border-0 rounded-md focus:outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
            >
              {courseTypes.map((type) => (
                <option key={type} value={type}>
                  {type === "all" ? "All" : type}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Grade List */}
      <div className="space-y-1">
        {filteredGrades.map((g, idx) => (
          <div
            key={g.slNo}
            className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 py-3 px-4 rounded-lg hover:bg-secondary/50 transition-colors group"
          >
            <div className="flex items-center gap-4 sm:gap-2 flex-1">
              <span className="w-6 text-xs text-muted-foreground">
                {idx + 1}
              </span>
              <span className="w-16 sm:w-20 font-mono text-xs text-muted-foreground truncate">
                {g.courseCode}
              </span>
              <span className="flex-1 text-sm text-foreground min-w-0">
                <span className="block sm:hidden font-medium">
                  {g.courseTitle}
                </span>
                <span className="hidden sm:block">{g.courseTitle}</span>
              </span>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-4">
              <span className="text-xs text-muted-foreground sm:hidden">
                {g.courseType} • {g.credits}cr
              </span>
              <span className="w-16 text-xs text-muted-foreground hidden sm:block">
                {g.courseType}
              </span>
              <span className="w-8 text-xs text-center text-muted-foreground hidden sm:block">
                {g.credits}cr
              </span>
              <span className="w-8 text-center">
                <GradeBadge grade={g.grade} />
              </span>
              <span className="w-20 text-xs text-muted-foreground text-right hidden sm:block">
                {g.examMonth}
              </span>
            </div>
          </div>
        ))}
        {filteredGrades.length === 0 && (
          <div className="py-10 text-center text-sm text-muted-foreground">
            No courses found
          </div>
        )}
      </div>
    </div>
  );
}
