import * as cheerio from "cheerio";

// ==========================================
// 1. Interfaces
// ==========================================

export interface StudentProfile {
  regNo: string;
  name: string;
  programme: string;
  gender: string;
  yearJoined: string;
  school: string;
  campus: string;
}

export interface CourseGrade {
  slNo: number;
  courseCode: string;
  courseTitle: string;
  courseType: string;
  credits: number;
  grade: string;
  examMonth: string;
  resultDeclared: string;
  courseDistribution: string;
}

export interface CurriculumCategory {
  category: string;
  creditsRequired: number;
  creditsEarned: number;
  completionStatus: "Completed" | "In Progress" | "Pending";
}

export interface CurriculumProgress {
  details: CurriculumCategory[];
  summary: {
    totalRequired: number;
    totalEarned: number;
  };
}

export interface CGPADetails {
  creditsRegistered: number;
  creditsEarned: number;
  cgpa: number;
  gradeDistribution: {
    s: number;
    a: number;
    b: number;
    c: number;
    d: number;
    e: number;
    f: number;
    n: number;
  };
}

export interface StudentHistoryData {
  profile: StudentProfile;
  grades: CourseGrade[];
  curriculum: CurriculumProgress;
  cgpa: CGPADetails;
}

// ==========================================
// 2. Parser Function
// ==========================================

export function parseStudentHistory(html: string): StudentHistoryData {
  const $ = cheerio.load(html);

  // Helper: Clean text (remove newlines, extra spaces)
  const clean = (text: string | undefined): string => {
    return text
      ? text
          .replace(/[\n\t]+/g, " ")
          .replace(/\s\s+/g, " ")
          .trim()
      : "";
  };

  // Helper: Safely parse numbers (handles "24.0", "9.12", etc.)
  const parseNum = (text: string | undefined): number => {
    return text ? parseFloat(clean(text)) || 0 : 0;
  };

  // -----------------------------------
  // A. Parse Student Profile
  // -----------------------------------
  let profile: Partial<StudentProfile> = {};

  // Strategy: Find any table header containing "Reg.No."
  const profileTable = $('.tableHeader:contains("Reg.No.")').closest("table");
  const profileRow = profileTable.find(".tableContent").first();
  const pCols = profileRow.find("td");

  if (pCols.length > 0) {
    profile = {
      regNo: clean($(pCols[0]).text()),
      name: clean($(pCols[1]).text()),
      programme: clean($(pCols[2]).text()),
      gender: clean($(pCols[5]).text()),
      yearJoined: clean($(pCols[6]).text()),
      school: clean($(pCols[8]).text()),
      campus: clean($(pCols[9]).text()),
    };
  }

  // -----------------------------------
  // B. Parse Effective Grades
  // -----------------------------------
  const grades: CourseGrade[] = [];

  // Strategy: Find table containing "Effective Grades"
  const gradesTable = $('.tableHeader:contains("Effective Grades")').closest(
    "table",
  );

  gradesTable.find("tr.tableContent").each((_, row) => {
    const $row = $(row);

    // SKIP HIDDEN ROWS: VTOP adds hidden rows with id="detailsView_..."
    if (
      $row.attr("id")?.startsWith("detailsView_") ||
      $row.css("display") === "none"
    ) {
      return;
    }

    const cols = $row.find("td");

    // Ensure it's a valid data row (index 1 is Course Code)
    if (cols.length > 5) {
      grades.push({
        slNo: parseNum($(cols[0]).text()),
        courseCode: clean($(cols[1]).text()),
        courseTitle: clean($(cols[2]).text()),
        courseType: clean($(cols[3]).text()),
        credits: parseNum($(cols[4]).text()),
        grade: clean($(cols[5]).text()),
        examMonth: clean($(cols[6]).text()),
        resultDeclared: clean($(cols[7]).text()),
        courseDistribution: clean($(cols[8]).text()),
      });
    }
  });

  // -----------------------------------
  // C. Parse Curriculum Details
  // -----------------------------------
  const curriculumDetails: CurriculumCategory[] = [];
  let curriculumSummary = { totalRequired: 0, totalEarned: 0 };

  // Strategy: Find table containing "Curriculum Distribution Type"
  const currTable = $(
    '.tableHeader:contains("Curriculum Distribution Type")',
  ).closest("table");

  currTable.find("tr.tableContent").each((_, row) => {
    const cols = $(row).find("td");
    const category = clean($(cols[0]).text());
    const req = parseNum($(cols[1]).text());
    const earned = parseNum($(cols[2]).text());

    if (!category) return;

    // Separate the "Total Credits" row from normal categories
    if (category.toLowerCase().includes("total credits")) {
      curriculumSummary = { totalRequired: req, totalEarned: earned };
    } else {
      curriculumDetails.push({
        category: category,
        creditsRequired: req,
        creditsEarned: earned,
        // Logic: if earned >= required -> Completed, else In Progress
        completionStatus:
          earned >= req ? "Completed" : earned > 0 ? "In Progress" : "Pending",
      });
    }
  });

  // -----------------------------------
  // D. Parse CGPA Details (FIXED)
  // -----------------------------------
  let cgpa: Partial<CGPADetails> = {};

  // Strategy: Instead of looking for the 'CGPA Details' title (which is in a div above),
  // we look for the unique column header "Credits Registered" inside the table itself.
  // This is much safer against HTML layout changes.

  // Find any cell (td) in a header row that matches "Credits Registered"
  const cgpaHeaderCell = $('td:contains("Credits Registered")');
  const cgpaTable = cgpaHeaderCell.closest("table");

  // Get the first data row in the tbody
  const cgpaRow = cgpaTable.find("tbody tr").first();
  const cgpaCols = cgpaRow.find("td");

  if (cgpaCols.length > 0) {
    cgpa = {
      creditsRegistered: parseNum($(cgpaCols[0]).text()),
      creditsEarned: parseNum($(cgpaCols[1]).text()),
      cgpa: parseNum($(cgpaCols[2]).text()),
      gradeDistribution: {
        s: parseNum($(cgpaCols[3]).text()),
        a: parseNum($(cgpaCols[4]).text()),
        b: parseNum($(cgpaCols[5]).text()),
        c: parseNum($(cgpaCols[6]).text()),
        d: parseNum($(cgpaCols[7]).text()),
        e: parseNum($(cgpaCols[8]).text()),
        f: parseNum($(cgpaCols[9]).text()),
        n: parseNum($(cgpaCols[10]).text()),
      },
    };
  }

  // -----------------------------------
  // Final Return
  // -----------------------------------
  return {
    profile: profile as StudentProfile,
    grades: grades,
    curriculum: {
      details: curriculumDetails,
      summary: curriculumSummary,
    },
    cgpa: cgpa as CGPADetails,
  };
}
