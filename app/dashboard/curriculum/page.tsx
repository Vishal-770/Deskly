"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/useAuth";
import { Category } from "@/types/electron/curriculum.types";
import { CourseEntry } from "@/lib/electron/parsers/Curriculum.parser";
import { Button } from "@/components/ui/button";
import Loader from "@/components/Loader";
import { ArrowLeft, Download, BookOpen, Search, X } from "lucide-react";

/* -------------------- Small Helpers -------------------- */

const CategoryCard = ({ category }: { category: Category }) => {
  const router = useRouter();

  const handleViewDetails = () => {
    router.push(`/dashboard/curriculum?category=${category.code}`);
  };

  return (
    <div
      onClick={handleViewDetails}
      className="group relative p-6 bg-card border border-border rounded-lg hover:border-primary hover:bg-secondary transition-all duration-200 cursor-pointer overflow-hidden"
    >
      <div className="absolute inset-0 bg-linear-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">
              {category.code}
            </h3>
            <p className="text-lg font-semibold text-foreground">
              {category.name}
            </p>
          </div>
          <BookOpen className="w-5 h-5 text-primary/60 group-hover:text-primary transition-colors" />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Credits Available</span>
            <span className="font-semibold text-foreground">
              {category.maxCredits}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Required Credits</span>
            <span className="font-semibold text-foreground">
              {category.credits}
            </span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">
            {category.maxCredits} credits available
          </span>
          <ArrowLeft className="w-4 h-4 text-primary transform rotate-180 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );
};

const CourseRow = ({ course }: { course: CourseEntry }) => {
  const handleDownloadSyllabus = async () => {
    try {
      const result = await window.curriculum.downloadSyllabus(course.code);
      if (result.success) {
        alert(result.message || "Syllabus downloaded successfully!");
      } else {
        alert("Error: " + result.error);
      }
    } catch (e) {
      alert("Error: " + (e instanceof Error ? e.message : String(e)));
    }
  };

  return (
    <tr className="border-b border-border hover:bg-secondary/30 transition-colors">
      <td className="px-4 py-4 text-sm font-medium text-muted-foreground w-12">
        {course.serialNo}
      </td>
      <td className="px-4 py-4 text-sm font-semibold text-primary">
        {course.code}
      </td>
      <td className="px-4 py-4 text-sm font-medium text-foreground max-w-xs truncate">
        {course.title}
      </td>
      <td className="px-4 py-4 text-sm text-center">
        <span className="px-2 py-1 rounded bg-muted text-muted-foreground text-xs font-medium">
          {course.courseType}
        </span>
      </td>
      <td className="px-4 py-4 text-sm text-center font-semibold text-foreground">
        {course.credits}
      </td>
      <td className="px-4 py-4 text-sm text-center text-muted-foreground">
        {course.lectureHours}
      </td>
      <td className="px-4 py-4 text-sm text-center text-muted-foreground">
        {course.tutorialHours}
      </td>
      <td className="px-4 py-4 text-sm text-center text-muted-foreground">
        {course.practicalHours}
      </td>
      <td className="px-4 py-4 text-sm text-center text-muted-foreground">
        {course.projectHours}
      </td>
      <td className="px-4 py-4 text-sm text-center">
        <button
          onClick={handleDownloadSyllabus}
          className="inline-flex items-center gap-1 px-3 py-2 rounded bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium transition-colors"
        >
          <Download className="w-3 h-3" />
          <span className="hidden sm:inline">Syllabus</span>
        </button>
      </td>
    </tr>
  );
};

/* -------------------- Page -------------------- */

const CurriculumPage = () => {
  const { authState, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const category = searchParams.get("category");

  const [curriculumData, setCurriculumData] = useState<Category[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [courses, setCourses] = useState<CourseEntry[] | null>(null);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  /* -------------------- Fetch -------------------- */

  useEffect(() => {
    if (!authState) return;

    let cancelled = false;

    const loadCurriculum = async () => {
      try {
        const curriculumRes = await window.curriculum.get();

        if (cancelled) return;

        if (curriculumRes?.success && curriculumRes.data) {
          setCurriculumData(curriculumRes.data);
        } else {
          setError("Failed to load curriculum data");
        }
      } catch (e) {
        console.error(e);
        setError("Something went wrong while loading curriculum");
      }
    };

    loadCurriculum();

    return () => {
      cancelled = true;
    };
  }, [authState]);

  useEffect(() => {
    if (!authState || !category) {
      return;
    }

    let cancelled = false;

    const loadCategoryDetails = async () => {
      try {
        const categoryRes = await window.curriculum.getCategoryView(category);

        if (cancelled) return;

        if (categoryRes?.success && categoryRes.data) {
          setCourses(categoryRes.data);
          setCategoryError(null);
        } else {
          setCategoryError("Failed to load category details");
        }
      } catch (e) {
        console.error(e);
        setCategoryError("Something went wrong while loading category details");
      }
    };

    loadCategoryDetails();

    return () => {
      cancelled = true;
    };
  }, [authState, category]);

  /* -------------------- Filtered Courses -------------------- */

  const filteredCourses = React.useMemo(() => {
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

  /* -------------------- States -------------------- */

  if (loading) {
    return <Loader />;
  }

  if (!authState) {
    return (
      <div className="h-full w-full flex items-center justify-center text-center">
        <div>
          <h2 className="text-lg font-semibold text-destructive">
            Access Denied
          </h2>
          <p className="text-muted-foreground">
            Please log in to view your curriculum.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  if (category) {
    if (categoryError) {
      return (
        <div className="h-full w-full flex items-center justify-center">
          <div className="text-center">
            <p className="text-destructive font-semibold mb-4">
              {categoryError}
            </p>
            <Button
              onClick={() => router.push("/dashboard/curriculum")}
              variant="outline"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Curriculum
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="h-full w-full bg-background flex flex-col">
        {/* Header */}
        <header className="border-b border-border px-8 py-6 bg-background">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.push("/dashboard/curriculum")}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground hover:text-foreground" />
            </button>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wide mb-1">
                Category
              </p>
              <h1 className="text-2xl font-bold text-foreground">{category}</h1>
            </div>
          </div>
        </header>

        {/* Search Bar */}
        <div className="px-8 py-4 border-b border-border">
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

        {/* Courses Table */}
        <section className="flex-1 overflow-auto px-8 py-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Courses
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {courses?.length || 0} course
                  {courses?.length !== 1 ? "s" : ""} available
                </p>
              </div>
            </div>

            {courses && courses.length > 0 ? (
              <div className="border border-border rounded-lg overflow-hidden bg-card">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-secondary/40">
                        <th className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider w-12">
                          #
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          Code
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          Title
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          Credits
                        </th>
                        <th
                          className="px-4 py-3 text-center text-xs font-bold text-muted-foreground uppercase tracking-wider"
                          title="Lecture Hours"
                        >
                          L
                        </th>
                        <th
                          className="px-4 py-3 text-center text-xs font-bold text-muted-foreground uppercase tracking-wider"
                          title="Tutorial Hours"
                        >
                          T
                        </th>
                        <th
                          className="px-4 py-3 text-center text-xs font-bold text-muted-foreground uppercase tracking-wider"
                          title="Practical Hours"
                        >
                          P
                        </th>
                        <th
                          className="px-4 py-3 text-center text-xs font-bold text-muted-foreground uppercase tracking-wider"
                          title="Project Hours"
                        >
                          J
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCourses.map((course, index) => (
                        <CourseRow
                          key={`${course.code}-${index}`}
                          course={course}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <BookOpen className="w-12 h-12 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">
                  {courses === null
                    ? "Loading courses..."
                    : searchQuery
                      ? `No courses match "${searchQuery}". Try a different search term.`
                      : "No courses found for this category."}
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    );
  }

  if (!curriculumData) {
    return <Loader />;
  }

  /* -------------------- UI -------------------- */

  const totalCredits = curriculumData.reduce(
    (sum, cat) => sum + cat.credits,
    0,
  );
  const maxTotalCredits = curriculumData.reduce(
    (sum, cat) => sum + cat.maxCredits,
    0,
  );

  return (
    <div className="h-full w-full bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border px-8 py-8 bg-background">
        <div className="max-w-7xl">
          <p className="text-sm text-muted-foreground font-medium uppercase tracking-wide mb-2">
            Academic Plan
          </p>
          <h1 className="text-3xl font-bold text-foreground mb-6">
            Curriculum Overview
          </h1>

          {/* Credits Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-secondary/30 border border-border rounded-lg p-4">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-2">
                Total Credits Available
              </p>
              <p className="text-2xl font-bold text-foreground">
                {maxTotalCredits}
              </p>
            </div>
            <div className="bg-secondary/30 border border-border rounded-lg p-4">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-2">
                Required Credits
              </p>
              <p className="text-2xl font-bold text-primary">{totalCredits}</p>
            </div>
            <div className="bg-secondary/30 border border-border rounded-lg p-4">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-2">
                Categories
              </p>
              <p className="text-2xl font-bold text-foreground">
                {curriculumData.length}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Categories Grid */}
      <main className="flex-1 overflow-auto px-8 py-8">
        <div className="max-w-7xl">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground">
              Categories
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Click on a category to view detailed course information
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {curriculumData.map((category, index) => (
              <CategoryCard key={index} category={category} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CurriculumPage;
