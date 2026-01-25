"use client";
import React, { useEffect, useState } from "react";
import {
  BookOpen,
  Calendar,
  Users,
  GraduationCap,
  Hash,
  Building2,
  Layers,
  FileText,
  Tag,
  Search,
  Grid3X3,
  List,
} from "lucide-react";
import { cn } from "../../../lib/utils";
import { CoursesResponse } from "../../../types/renderer/Course.types";
import { CourseDetails } from "../../../types/electron/Course.types";

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function CourseCard({
  course,
  viewMode = "list",
}: {
  course: CourseDetails;
  viewMode?: "list" | "grid";
}) {
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded bg-primary/10 text-xs font-bold text-primary">
            {course.slNo}
          </span>
          <span className="rounded bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground">
            {course.code}
          </span>
        </div>
        <span className="rounded-full bg-chart-1/15 px-3 py-1 text-sm font-semibold text-chart-1">
          {course.credits.total} Credits
        </span>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3
          className={cn(
            "mb-4 text-lg font-semibold text-foreground",
            viewMode === "grid" ? "text-base" : "",
          )}
        >
          {course.title}
        </h3>

        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 gap-4"
              : "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"
          }
        >
          {/* Course Info */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Course Info
            </p>
            <div className="space-y-1.5 text-sm">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Type:</span>
                <span className="text-foreground">{course.courseType}</span>
              </div>
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Category:</span>
                <span className="text-foreground">{course.category}</span>
              </div>
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Option:</span>
                <span className="text-foreground">
                  {course.registrationOption}
                </span>
              </div>
            </div>
          </div>

          {/* Faculty */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Faculty
            </p>
            <div className="space-y-1.5 text-sm">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">{course.faculty.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">School:</span>
                <span className="text-foreground">{course.faculty.school}</span>
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Schedule
            </p>
            <div className="space-y-1.5 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Slot:</span>
                <span className="font-mono text-foreground">{course.slot}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Venue:</span>
                <span className="text-foreground">{course.venue}</span>
              </div>
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">ID:</span>
                <span className="font-mono text-xs text-foreground">
                  {course.classId}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Grid3X3 className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Group:</span>
                <span className="text-foreground">{course.classGroup}</span>
              </div>
            </div>
          </div>

          {/* Credits */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Credits
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded border border-border bg-muted/30 p-2 text-center">
                <p className="text-lg font-bold text-foreground">
                  {course.credits.lecture}
                </p>
                <p className="text-xs text-muted-foreground">Lecture</p>
              </div>
              <div className="rounded border border-border bg-muted/30 p-2 text-center">
                <p className="text-lg font-bold text-foreground">
                  {course.credits.tutorial}
                </p>
                <p className="text-xs text-muted-foreground">Tutorial</p>
              </div>
              <div className="rounded border border-border bg-muted/30 p-2 text-center">
                <p className="text-lg font-bold text-foreground">
                  {course.credits.practical}
                </p>
                <p className="text-xs text-muted-foreground">Practical</p>
              </div>
              <div className="rounded border border-border bg-muted/30 p-2 text-center">
                <p className="text-lg font-bold text-foreground">
                  {course.credits.project}
                </p>
                <p className="text-xs text-muted-foreground">Project</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<CourseDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response: CoursesResponse = await window.timetable.courses();
        if (response.success && response.data) {
          setCourses(response.data);
        } else {
          setError(response.error || "Failed to load courses");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const filteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.faculty.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const totalCredits = courses.reduce(
    (sum, course) => sum + course.credits.total,
    0,
  );
  const lectureCredits = courses.reduce(
    (sum, course) => sum + course.credits.lecture,
    0,
  );
  const practicalCredits = courses.reduce(
    (sum, course) =>
      sum +
      course.credits.practical +
      course.credits.tutorial +
      course.credits.project,
    0,
  );
  const tutorialCredits = courses.reduce(
    (sum, course) => sum + course.credits.tutorial,
    0,
  );
  const labCredits = practicalCredits - tutorialCredits;
  const lectureTutorialCredits = lectureCredits + tutorialCredits;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading courses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
          <h1 className="mb-2 text-xl font-semibold text-destructive">Error</h1>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl space-y-6 p-6">
        {/* Title & Search */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <GraduationCap className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                Course Manager
              </h1>
              <p className="text-sm text-muted-foreground">
                Current Semester Overview
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 w-full rounded-lg border border-border bg-input pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary md:w-64"
              />
            </div>
            <div className="flex items-center gap-1 rounded-lg border border-border bg-muted p-1">
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-md transition-colors",
                  viewMode === "list"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <List className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-md transition-colors",
                  viewMode === "grid"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard
            label="Total Courses"
            value={courses.length}
            icon={BookOpen}
          />
          <StatCard
            label="Total Credits"
            value={totalCredits}
            icon={GraduationCap}
          />
          <StatCard
            label="Lecture & Tutorial"
            value={lectureTutorialCredits}
            icon={Users}
          />
          <StatCard label="Lab Classes" value={labCredits} icon={Layers} />
        </div>

        {/* Course Count */}
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-foreground">
            Enrolled Courses
          </h2>
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-sm text-muted-foreground">
            {filteredCourses.length}
          </span>
        </div>

        {/* Courses - List View */}
        {viewMode === "list" && (
          <div className="space-y-4">
            {filteredCourses.map((course) => (
              <CourseCard key={course.slNo} course={course} viewMode="list" />
            ))}
          </div>
        )}

        {/* Courses - Grid View */}
        {viewMode === "grid" && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2">
            {filteredCourses.map((course) => (
              <CourseCard key={course.slNo} course={course} viewMode="grid" />
            ))}
          </div>
        )}

        {/* No Results Message */}
        {filteredCourses.length === 0 && searchQuery && (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">
              No courses found matching &apos;{searchQuery}&apos;
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Try adjusting your search terms.
            </p>
          </div>
        )}

        {/* Credit Distribution Table */}
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="border-b border-border bg-muted/30 px-4 py-3">
            <h2 className="font-semibold text-foreground">
              Credit Distribution
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Code
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Title
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                    Lecture
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                    Tutorial
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                    Practical
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                    Project
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr
                    key={course.slNo}
                    className="border-b border-border last:border-b-0 hover:bg-muted/20"
                  >
                    <td className="px-4 py-3 font-mono text-primary">
                      {course.code}
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {course.title}
                    </td>
                    <td className="px-4 py-3 text-center text-foreground">
                      {course.credits.lecture}
                    </td>
                    <td className="px-4 py-3 text-center text-foreground">
                      {course.credits.tutorial}
                    </td>
                    <td className="px-4 py-3 text-center text-foreground">
                      {course.credits.practical}
                    </td>
                    <td className="px-4 py-3 text-center text-foreground">
                      {course.credits.project}
                    </td>
                    <td className="px-4 py-3 text-center font-semibold text-primary">
                      {course.credits.total}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-primary/10">
                  <td
                    colSpan={2}
                    className="px-4 py-3 font-semibold text-foreground"
                  >
                    Total
                  </td>
                  <td className="px-4 py-3 text-center font-semibold text-foreground">
                    {lectureCredits}
                  </td>
                  <td className="px-4 py-3 text-center font-semibold text-foreground">
                    {courses.reduce((sum, c) => sum + c.credits.tutorial, 0)}
                  </td>
                  <td className="px-4 py-3 text-center font-semibold text-foreground">
                    {courses.reduce((sum, c) => sum + c.credits.practical, 0)}
                  </td>
                  <td className="px-4 py-3 text-center font-semibold text-foreground">
                    {courses.reduce((sum, c) => sum + c.credits.project, 0)}
                  </td>
                  <td className="px-4 py-3 text-center font-bold text-primary">
                    {totalCredits}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
