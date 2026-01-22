"use client";
import React from "react";
import { GraduationCap, TrendingUp, Award } from "lucide-react";

export default function GradesPage() {
  // Dummy grade data
  const grades = [
    {
      id: 1,
      course: "CS101",
      courseName: "Introduction to Computer Science",
      grade: "A",
      points: 4.0,
      credits: 3,
      semester: "Fall 2025",
    },
    {
      id: 2,
      course: "MATH201",
      courseName: "Calculus II",
      grade: "B+",
      points: 3.5,
      credits: 4,
      semester: "Fall 2025",
    },
    {
      id: 3,
      course: "PHYS101",
      courseName: "Physics I",
      grade: "A-",
      points: 3.7,
      credits: 4,
      semester: "Fall 2025",
    },
    {
      id: 4,
      course: "ENG101",
      courseName: "English Composition",
      grade: "B",
      points: 3.0,
      credits: 3,
      semester: "Spring 2025",
    },
  ];

  const currentGPA = 3.55;
  const totalCredits = grades.reduce((sum, grade) => sum + grade.credits, 0);

  const getGradeColor = (grade: string) => {
    if (grade.startsWith("A")) return "text-green-600 bg-green-100";
    if (grade.startsWith("B")) return "text-blue-600 bg-blue-100";
    if (grade.startsWith("C")) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-1">
        <h1 className="text-3xl font-bold">Academic Grades</h1>
        <p className="text-muted-foreground">Your complete grade history</p>
      </div>

      {/* GPA Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-xl border bg-card p-6 shadow-sm text-center">
          <div className="flex items-center justify-center mb-2">
            <Award className="w-8 h-8 text-primary" />
          </div>
          <div className="text-3xl font-bold text-primary">{currentGPA}</div>
          <div className="text-sm text-muted-foreground">Current GPA</div>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm text-center">
          <div className="flex items-center justify-center mb-2">
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-green-600">
            {totalCredits}
          </div>
          <div className="text-sm text-muted-foreground">Total Credits</div>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm text-center">
          <div className="flex items-center justify-center mb-2">
            <GraduationCap className="w-8 h-8 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-blue-600">
            {grades.length}
          </div>
          <div className="text-sm text-muted-foreground">Courses Completed</div>
        </div>
      </div>

      {/* Grades Table */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-semibold">Grade History</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4 font-semibold">Course</th>
                <th className="text-left p-4 font-semibold">Grade</th>
                <th className="text-left p-4 font-semibold">Points</th>
                <th className="text-left p-4 font-semibold">Credits</th>
                <th className="text-left p-4 font-semibold">Semester</th>
              </tr>
            </thead>
            <tbody>
              {grades.map((grade) => (
                <tr key={grade.id} className="border-t border-border/50">
                  <td className="p-4">
                    <div>
                      <div className="font-semibold">{grade.course}</div>
                      <div className="text-sm text-muted-foreground">
                        {grade.courseName}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded text-sm font-semibold ${getGradeColor(
                        grade.grade,
                      )}`}
                    >
                      {grade.grade}
                    </span>
                  </td>
                  <td className="p-4 font-semibold">{grade.points}</td>
                  <td className="p-4">{grade.credits}</td>
                  <td className="p-4 text-muted-foreground">
                    {grade.semester}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grade Distribution */}
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Grade Distribution</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-100 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {grades.filter((g) => g.grade.startsWith("A")).length}
            </div>
            <div className="text-sm text-muted-foreground">A Grades</div>
          </div>
          <div className="text-center p-4 bg-blue-100 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {grades.filter((g) => g.grade.startsWith("B")).length}
            </div>
            <div className="text-sm text-muted-foreground">B Grades</div>
          </div>
          <div className="text-center p-4 bg-yellow-100 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {grades.filter((g) => g.grade.startsWith("C")).length}
            </div>
            <div className="text-sm text-muted-foreground">C Grades</div>
          </div>
          <div className="text-center p-4 bg-red-100 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {
                grades.filter((g) => g.grade.startsWith("D") || g.grade === "F")
                  .length
              }
            </div>
            <div className="text-sm text-muted-foreground">D/F Grades</div>
          </div>
        </div>
      </div>
    </div>
  );
}
