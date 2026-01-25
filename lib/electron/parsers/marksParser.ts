import { AssessmentMark, StudentMarkEntry } from "@/types/electron/marks.types";
import * as cheerio from "cheerio";

// Interface for individual assessment marks (e.g., CAT-1, Quiz-1)


/**
 * Parses the VTOP Marks View HTML string.
 * @param htmlString - The raw HTML content from the marks page.
 * @returns Array of StudentMarkEntry objects containing course info and marks.
 */
export function parseStudentMarks(htmlString: string): StudentMarkEntry[] {
  const $ = cheerio.load(htmlString);
  const courses: StudentMarkEntry[] = [];

  // Select all content rows in the main customTable
  // The table rows alternate between "Course Info" and "Assessment Details"
  const rows = $(".customTable > tbody > tr.tableContent");

  let currentCourse: StudentMarkEntry | null = null;

  rows.each((index, element) => {
    const $row = $(element);
    const cols = $row.children("td");

    // Check if this is a "Course Info" row or a "Details" row
    // Course Info rows have multiple columns (9 based on the header)
    // Details rows usually have a colspan (e.g., colspan="9")
    const isDetailsRow = cols.attr("colspan") !== undefined || cols.length === 1;

    if (!isDetailsRow) {
      // --- PARSE COURSE INFO ROW ---
      // Columns: Sl.No | ClassNbr | Code | Title | Type | System | Faculty | Slot | Mode
      const getText = (i: number) => $(cols[i]).text().trim();

      currentCourse = {
        slNo: parseInt(getText(0), 10) || 0,
        classNumber: getText(1),
        courseCode: getText(2),
        courseTitle: getText(3),
        courseType: getText(4),
        courseSystem: getText(5),
        faculty: getText(6),
        slot: getText(7),
        courseMode: getText(8),
        assessments: [], // Initialize empty array for marks
      };
      
      courses.push(currentCourse);

    } else if (currentCourse) {
      // --- PARSE DETAILS ROW (NESTED TABLE) ---
      // Find the nested table with class "customTable-level1" inside this row
      const nestedRows = $row.find(".customTable-level1 tr.tableContent-level1");

      nestedRows.each((_, nestedRow) => {
        const $nCols = $(nestedRow).find("td");
        
        // Helper to get text from <output> tag or directly from td
        const getMarkText = (i: number) => $nCols.eq(i).text().trim();

        const assessment: AssessmentMark = {
          slNo: parseInt(getMarkText(0), 10) || 0,
          markTitle: getMarkText(1),
          maxMark: parseFloat(getMarkText(2)) || 0,
          weightagePercent: parseFloat(getMarkText(3)) || 0,
          status: getMarkText(4),
          scoredMark: parseFloat(getMarkText(5)) || 0,
          weightageMark: parseFloat(getMarkText(6)) || 0,
          classAverage: getMarkText(7), // Often empty
          remark: getMarkText(9),       // Often empty
        };

        currentCourse?.assessments.push(assessment);
      });
    }
  });

  return courses;
}