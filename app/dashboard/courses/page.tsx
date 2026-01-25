"use client";
import React, { useEffect, useState } from "react";
import { BookOpen, Calendar, Clock, Users } from "lucide-react";
import { CoursesResponse } from "../../../types/renderer/Course.types";
import { CourseDetails } from "../../../types/electron/Course.types";
import { Separator } from "../../../components/ui/separator";
export default function CoursesPage() {
  const [courses, setCourses] = useState<CourseDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center space-y-1">
        <h1 className="text-3xl font-bold">Error</h1>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-1">
        <h1 className="text-3xl font-bold">My Courses</h1>
        <p className="text-muted-foreground">
          Current semester course schedule
        </p>
      </div>

      {/* Course Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div
            key={course.slNo}
            className="rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <span className="text-sm font-bold text-primary bg-primary/10 px-2 py-1 rounded">
                {course.code}
              </span>
            </div>

            <h3 className="text-lg font-semibold mb-2">{course.title}</h3>

            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>
                  {course.faculty.name} ({course.faculty.school})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{course.slot}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{course.venue}</span>
              </div>
            </div>

            <Separator className="my-3" />

            <div className="space-y-1 text-xs">
              <div>
                <strong>Type:</strong> {course.courseType}
              </div>
              <div>
                <strong>Category:</strong> {course.category}
              </div>
              <div>
                <strong>Registration Type:</strong> {course.registrationOption}
              </div>
              <div>
                <strong>Class ID:</strong> {course.classId}
              </div>
              <div>
                <strong>Class Group:</strong> {course.classGroup}
              </div>
            </div>

            <Separator className="my-3" />

            <div className="mt-4 pt-4 border-t border-border">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Lecture:</span>{" "}
                  {course.credits.lecture}
                </div>
                <div>
                  <span className="text-muted-foreground">Tutorial:</span>{" "}
                  {course.credits.tutorial}
                </div>
                <div>
                  <span className="text-muted-foreground">Practical:</span>{" "}
                  {course.credits.practical}
                </div>
                <div>
                  <span className="text-muted-foreground">Project:</span>{" "}
                  {course.credits.project}
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Total Credits:</span>{" "}
                  <span className="font-semibold">{course.credits.total}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Course Summary</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-primary/10 rounded-lg">
            <div className="text-2xl font-bold text-primary">
              {courses.length}
            </div>
            <div className="text-sm text-muted-foreground">Total Courses</div>
          </div>
          <div className="text-center p-4 bg-green-100 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {courses.reduce((sum, course) => sum + course.credits.total, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Total Credits</div>
          </div>
          <div className="text-center p-4 bg-blue-100 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">1</div>
            <div className="text-sm text-muted-foreground">This Semester</div>
          </div>
        </div>
      </div>
    </div>
  );
}
