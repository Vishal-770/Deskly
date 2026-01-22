"use client";
import React from "react";
import { BookOpen, Calendar, Clock, Users } from "lucide-react";

export default function CoursesPage() {
  // Dummy course data
  const courses = [
    {
      id: 1,
      code: "CS101",
      name: "Introduction to Computer Science",
      instructor: "Dr. Smith",
      schedule: "Mon, Wed 10:00 AM",
      room: "Room 101",
      credits: 3,
    },
    {
      id: 2,
      code: "MATH201",
      name: "Calculus II",
      instructor: "Prof. Johnson",
      schedule: "Tue, Thu 2:00 PM",
      room: "Room 205",
      credits: 4,
    },
    {
      id: 3,
      code: "PHYS101",
      name: "Physics I",
      instructor: "Dr. Brown",
      schedule: "Mon, Wed, Fri 11:00 AM",
      room: "Lab 301",
      credits: 4,
    },
  ];

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
            key={course.id}
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

            <h3 className="text-lg font-semibold mb-2">{course.name}</h3>

            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{course.instructor}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{course.schedule}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{course.room}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Credits</span>
                <span className="font-semibold">{course.credits}</span>
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
              {courses.reduce((sum, course) => sum + course.credits, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Total Credits</div>
          </div>
          <div className="text-center p-4 bg-blue-100 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">3</div>
            <div className="text-sm text-muted-foreground">This Semester</div>
          </div>
        </div>
      </div>
    </div>
  );
}
