"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/useAuth";
import { CourseEntry } from "@/lib/electron-utils/parsers/Curriculum.parser";
import { Button } from "@/components/ui/button";
import Loader from "@/components/Loader";
import {
  ArrowLeft,
  Download,
  BookOpen,
  GraduationCap,
  FileText,
  AlertCircle,
  Search,
  X,
} from "lucide-react";

/* -------------------- Types & Interfaces -------------------- */

interface CourseRowProps {
  course: CourseEntry;
}

/* -------------------- Sub-Components -------------------- */

const CourseRow: React.FC<CourseRowProps> = ({ course }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadSyllabus = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDownloading) return;

    setIsDownloading(true);
    try {
      const result = await window.curriculum.downloadSyllabus(course.code);
      if (result.success) {
        alert(result.message || "Syllabus downloaded successfully!");
      } else {
        alert("Error: " + result.error);
      }
    } catch (e) {
      alert("Error: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <tr className="group border-b border-border hover:bg-muted/30 transition-colors duration-150 ease-in-out last:border-0">
      <td className="py-4 pl-6 pr-3 text-xs text-muted-foreground font-mono">
        {course.serialNo}
      </td>
      <td className="py-4 px-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 group-hover:text-primary transition-colors">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="font-mono text-xs font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded inline-block mb-1">
              {course.code}
            </div>
            <div className="text-sm font-medium text-foreground line-clamp-1">
              {course.title}
            </div>
          </div>
        </div>
      </td>
      <td className="py-4 px-3 text-center">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
          ${
            course.courseType.includes("Lab")
              ? "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300"
              : course.courseType.includes("Project")
                ? "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                : "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
          }`}
        >
          {course.courseType}
        </span>
      </td>
      <td className="py-4 px-3 text-center">
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-bold text-foreground border border-border">
          {course.credits}
        </span>
      </td>
      <td className="py-4 px-3 text-center text-sm text-muted-foreground font-mono">
        {course.lectureHours}
      </td>
      <td className="py-4 px-3 text-center text-sm text-muted-foreground font-mono">
        {course.tutorialHours}
      </td>
      <td className="py-4 px-3 text-center text-sm text-muted-foreground font-mono">
        {course.practicalHours}
      </td>
      <td className="py-4 px-3 text-center text-sm text-muted-foreground font-mono">
        {course.projectHours}
      </td>

      <td className="py-4 px-3 pr-6 text-right">
        <Button
          onClick={handleDownloadSyllabus}
          size="icon"
          variant="ghost"
          className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
          title="Download Syllabus"
          disabled={isDownloading}
        >
          <Download
            className={`w-4 h-4 ${isDownloading ? "animate-pulse" : ""}`}
          />
        </Button>
      </td>
    </tr>
  );
};

/* -------------------- Main Page -------------------- */

const CategoryDetailPage = () => {
  const { categoryId } = useParams();
  const router = useRouter();
  const { authState, loading } = useAuth();

  const [courses, setCourses] = useState<CourseEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  /* -------------------- Fetch Logic -------------------- */

  useEffect(() => {
    if (!authState || !categoryId) return;

    let cancelled = false;

    const loadCategoryDetails = async () => {
      try {
        const categoryRes = await window.curriculum.getCategoryView(
          categoryId as string,
        );

        if (cancelled) return;

        if (categoryRes?.success && categoryRes.data) {
          setCourses(categoryRes.data);
        } else {
          setError("Failed to load category details");
        }
      } catch (e) {
        console.error("Error loading category details:", e);
        setError("Something went wrong while loading category details");
      }
    };

    loadCategoryDetails();

    return () => {
      cancelled = true;
    };
  }, [authState, categoryId]);

  /* -------------------- Computed Stats & Filtered Courses -------------------- */

  const filteredCourses = useMemo(() => {
    if (!courses) return [];
    if (!searchQuery.trim()) return courses;

    const query = searchQuery.toLowerCase();
    return courses.filter(
      (course) =>
        course.code.toLowerCase().includes(query) ||
        course.title.toLowerCase().includes(query) ||
        course.courseType.toLowerCase().includes(query),
    );
  }, [courses, searchQuery]);

  const stats = useMemo(() => {
    const courseList = filteredCourses;
    return {
      totalCourses: courseList.length,
      totalCredits: courseList.reduce(
        (acc, curr) => acc + (curr.credits || 0),
        0,
      ),
    };
  }, [filteredCourses]);

  /* -------------------- Loading / Error States -------------------- */

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-background">
        <Loader />
      </div>
    );
  }

  if (!authState) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center text-center bg-muted/20 p-6">
        <div className="bg-card p-8 rounded-2xl shadow-sm border border-border max-w-md">
          <div className="w-12 h-12 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-card-foreground mb-2">
            Access Restricted
          </h2>
          <p className="text-muted-foreground mb-6">
            Please log in to view the curriculum details for this category.
          </p>
          <Button onClick={() => router.push("/login")}>Go to Login</Button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <p className="text-card-foreground font-medium">{error}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  /* -------------------- Desktop Layout -------------------- */

  return (
    <div className="flex flex-col h-full bg-background relative overflow-hidden">
      {/* 1. Sticky Desktop Header */}
      <header className="flex-none sticky top-0 z-20 w-full bg-background border-b border-border">
        <div className="px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 -ml-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
              onClick={() => router.push("/dashboard/curriculum")}
              title="Back to Curriculum"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>

            <div className="h-8 w-px bg-border mx-1 hidden sm:block" />

            <div className="flex flex-col justify-center">
              <h1 className="text-lg font-bold text-foreground leading-none mb-1">
                {categoryId}
              </h1>
              <span className="text-xs text-muted-foreground font-medium tracking-wide uppercase">
                Category View
              </span>
            </div>
          </div>

          {/* Quick Stats in Header */}
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground bg-muted px-3 py-1.5 rounded-md border border-border">
              <FileText className="w-4 h-4 text-primary" />
              <span className="font-semibold text-foreground">
                {stats.totalCourses}
              </span>
              <span className="text-muted-foreground">Courses</span>
            </div>
            <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground bg-muted px-3 py-1.5 rounded-md border border-border">
              <GraduationCap className="w-4 h-4 text-primary" />
              <span className="font-semibold text-foreground">
                {stats.totalCredits}
              </span>
              <span className="text-muted-foreground">Credits</span>
            </div>
          </div>
        </div>

        {/* Subtle Progress/Decoration Line */}
        <div className="h-[1px] w-full bg-gradient-to-r from-primary/20 via-primary/20 to-primary/20" />
      </header>

      {/* Search Bar */}
      <div className="flex-none px-6 py-4 bg-background border-b border-border">
        <div className="max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search courses by code, title, or type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-background border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {searchQuery && (
            <p className="mt-2 text-xs text-muted-foreground">
              Found {filteredCourses.length} course
              {filteredCourses.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>

      {/* 2. Scrollable Content Area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
        <div className="min-w-[800px]">
          {filteredCourses && filteredCourses.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10 bg-muted/50 backdrop-blur-sm shadow-sm ring-1 ring-border/5">
                <tr>
                  <th className="py-3 pl-6 pr-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground w-16">
                    #
                  </th>
                  <th className="py-3 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Course Details
                  </th>
                  <th className="py-3 px-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground w-32">
                    Type
                  </th>
                  <th className="py-3 px-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground w-24">
                    Credits
                  </th>
                  <th
                    className="py-3 px-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground w-16"
                    title="Lecture Hours"
                  >
                    L
                  </th>
                  <th
                    className="py-3 px-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground w-16"
                    title="Tutorial Hours"
                  >
                    T
                  </th>
                  <th
                    className="py-3 px-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground w-16"
                    title="Practical Hours"
                  >
                    P
                  </th>
                  <th
                    className="py-3 px-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground w-16"
                    title="Project Hours"
                  >
                    J
                  </th>
                  <th className="py-3 px-3 pr-6 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground w-20">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-background divide-y divide-border">
                {filteredCourses.map((course, index) => (
                  <CourseRow key={`${course.code}-${index}`} course={course} />
                ))}
              </tbody>
            </table>
          ) : (
            /* Empty State */
            <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <BookOpen className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                No courses found
              </h3>
              <p className="text-muted-foreground max-w-sm mt-2">
                {searchQuery
                  ? `No courses match "${searchQuery}". Try a different search term.`
                  : "This category appears to be empty or the data is currently unavailable."}
              </p>
            </div>
          )}

          {/* Bottom spacer for comfortable scrolling */}
          <div className="h-12" />
        </div>
      </main>
    </div>
  );
};

export default CategoryDetailPage;
