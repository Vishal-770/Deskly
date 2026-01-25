"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/useAuth";
import { CourseEntry } from "@/lib/electron/parsers/Curriculum.parser";
import { Button } from "@/components/ui/button";
import Loader from "@/components/Loader";
import { ArrowLeft } from "lucide-react";

/* -------------------- Small Helpers -------------------- */

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
    <tr className="border-b">
      <td className="p-3 text-sm">{course.serialNo}</td>
      <td className="p-3 text-sm font-medium">{course.code}</td>
      <td className="p-3 text-sm">{course.title}</td>
      <td className="p-3 text-sm text-center">{course.courseType}</td>
      <td className="p-3 text-sm text-center">{course.credits}</td>
      <td className="p-3 text-sm text-center">{course.lectureHours}</td>
      <td className="p-3 text-sm text-center">{course.tutorialHours}</td>
      <td className="p-3 text-sm text-center">{course.practicalHours}</td>
      <td className="p-3 text-sm text-center">{course.projectHours}</td>
      <td className="p-3 text-sm text-center">
        <Button onClick={handleDownloadSyllabus} size="sm" variant="outline">
          Download
        </Button>
      </td>
    </tr>
  );
};

/* -------------------- Page -------------------- */

const CategoryDetailPage = () => {
  const { categoryId } = useParams();
  const router = useRouter();
  const { authState, loading } = useAuth();

  const [courses, setCourses] = useState<CourseEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  /* -------------------- Fetch -------------------- */

  useEffect(() => {
    console.log("useEffect triggered", { authState, categoryId });
    if (!authState || !categoryId) return;

    let cancelled = false;

    const loadCategoryDetails = async () => {
      try {
        console.log("Loading category details for:", categoryId);
        const categoryRes = await window.curriculum.getCategoryView(
          categoryId as string,
        );

        if (cancelled) return;

        console.log("Category response:", categoryRes);

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

  /* -------------------- States -------------------- */

  if (loading) {
    return <Loader />;
  }

  if (!authState) {
    return (
      <div className="h-full w-full flex items-center justify-center text-center">
        <div>
          <h2 className="text-lg font-semibold text-red-600">Access Denied</h2>
          <p className="text-muted-foreground">
            Please log in to view category details.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  /* -------------------- UI -------------------- */

  return (
    <div className="h-full w-full px-6 lg:px-10 py-6 space-y-6">
      {/* Header */}
      <header className="space-y-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/dashboard/curriculum")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Curriculum
          </Button>
        </div>
        <div>
          <h1 className="text-3xl font-bold">Category: {categoryId}</h1>
          <p className="text-muted-foreground">
            Course details for this curriculum category.
          </p>
        </div>
      </header>

      {/* Courses Table */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Courses</h2>
        {courses && courses.length > 0 ? (
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="p-3 text-left text-sm font-medium">S.No</th>
                  <th className="p-3 text-left text-sm font-medium">Code</th>
                  <th className="p-3 text-left text-sm font-medium">Title</th>
                  <th className="p-3 text-center text-sm font-medium">Type</th>
                  <th className="p-3 text-center text-sm font-medium">
                    Credits
                  </th>
                  <th className="p-3 text-center text-sm font-medium">L</th>
                  <th className="p-3 text-center text-sm font-medium">T</th>
                  <th className="p-3 text-center text-sm font-medium">P</th>
                  <th className="p-3 text-center text-sm font-medium">J</th>
                  <th className="p-3 text-center text-sm font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <CourseRow key={course.serialNo} course={course} />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {courses === null
                ? "Loading courses..."
                : "No courses found for this category."}
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default CategoryDetailPage;
