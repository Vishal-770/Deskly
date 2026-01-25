"use client";

import { useEffect, useState } from "react";
import { StudentMarkEntry } from "@/types/electron/marks.types";
import { useSemester } from "@/components/useSemester";
import { BookOpen, User, Calendar, TrendingUp, Circle } from "lucide-react";

export default function MarksPage() {
  const { currentSemester, loading: semesterLoading } = useSemester();
  const [marksData, setMarksData] = useState<StudentMarkEntry[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeCourse, setActiveCourse] = useState<string | null>(null);

  useEffect(() => {
    const fetchMarks = async () => {
      if (!currentSemester?.id) return;

      setLoading(true);
      setError(null);

      try {
        const result = await window.marks.getStudentMarkView(
          currentSemester.id,
        );
        if (result.success && result.data) {
          setMarksData(result.data);
          setActiveCourse(result.data[0]?.courseCode ?? null);
        } else {
          setError(result.error || "Failed to fetch marks");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    if (currentSemester) fetchMarks();
  }, [currentSemester]);

  if (semesterLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading marks…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <BookOpen className="w-10 h-10 mx-auto mb-4 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (!marksData || marksData.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">No marks data available</p>
      </div>
    );
  }

  const activeCourseData = marksData.find((c) => c.courseCode === activeCourse);

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-8 py-16">
        {/* Header */}
        <div className="mb-12">
          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Academic Performance
          </span>
          <h1 className="text-4xl font-light mt-2 mb-1">Marks Overview</h1>
          <p className="text-muted-foreground">
            {currentSemester?.name} · {marksData.length} courses
          </p>
        </div>

        {/* ---------- FLEX WRAP TAB BAR ---------- */}
        <div className="mb-10">
          <div className="flex flex-wrap gap-x-3 gap-y-4">
            {marksData.map((course) => {
              const isActive = activeCourse === course.courseCode;

              return (
                <button
                  key={course.courseCode}
                  onClick={() => setActiveCourse(course.courseCode)}
                  className={`
                    px-4 py-2 rounded-md text-sm font-mono whitespace-nowrap
                    transition-all
                    ${
                      isActive
                        ? "bg-secondary text-foreground shadow-sm"
                        : "bg-secondary/40 text-muted-foreground hover:bg-secondary/70"
                    }
                  `}
                >
                  {course.courseCode}
                </button>
              );
            })}
          </div>
        </div>

        {/* ---------- ACTIVE COURSE CONTENT ---------- */}
        {activeCourseData && (
          <section>
            {/* Course Header */}
            <div className="flex items-start justify-between mb-8">
              <div>
                <h2 className="text-xl font-medium mb-1">
                  {activeCourseData.courseTitle}
                </h2>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="font-mono text-xs">
                    {activeCourseData.courseCode}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    {activeCourseData.faculty}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {activeCourseData.slot}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs uppercase text-muted-foreground block mb-1">
                  Total
                </span>
                <span className="text-2xl font-light">
                  {activeCourseData.assessments
                    .reduce((s, a) => s + a.weightageMark, 0)
                    .toFixed(2)}
                </span>
                <span className="text-muted-foreground text-sm ml-1">
                  / 100
                </span>
              </div>
            </div>

            {/* Assessments */}
            {activeCourseData.assessments.length > 0 ? (
              <div className="space-y-4 pl-4 border-l">
                {activeCourseData.assessments.map((assessment, idx) => {
                  const percentage =
                    (assessment.scoredMark / assessment.maxMark) * 100;

                  const color =
                    percentage >= 80
                      ? "bg-green-500"
                      : percentage >= 60
                        ? "bg-yellow-500"
                        : "bg-red-500";

                  return (
                    <div key={idx} className="relative pl-6">
                      <Circle
                        className={`absolute left-[-5px] top-3 w-2 h-2 fill-current ${color}`}
                      />

                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{assessment.markTitle}</p>
                          <p className="text-xs text-muted-foreground">
                            Weight: {assessment.weightagePercent}%
                          </p>
                        </div>

                        <div className="text-right">
                          <span className="text-lg">
                            {assessment.scoredMark}
                          </span>
                          <span className="text-muted-foreground">
                            {" "}
                            / {assessment.maxMark}
                          </span>
                        </div>
                      </div>

                      <div className="mt-2 h-1 bg-border rounded-full">
                        <div
                          className={`h-full rounded-full ${color}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>

                      {assessment.classAverage && (
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          Avg: {assessment.classAverage}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                No assessments recorded yet
              </p>
            )}
          </section>
        )}

        {/* Footer */}
        <div className="mt-24 pt-8 border-t text-sm text-muted-foreground flex justify-between">
          <span>Last updated: Today</span>
          <span>{currentSemester?.name}</span>
        </div>
      </div>
    </main>
  );
}
