import * as cheerio from "cheerio";

// Interface defining the structure of the parsed attendance record
export interface AttendanceRecord {
  slNo: number;
  courseCode: string;
  courseTitle: string;
  courseType: string;
  slot: string;
  faculty: {
    id: string;
    name: string;
    school: string;
  };
  attendanceType: string;
  registrationDate: string;
  attendanceDate: string; // The date shown in the "Attendance Date" column
  attendedClasses: number;
  totalClasses: number;
  attendancePercentage: number;
  status: string;
  classId: string; // Extracted from the "View" button script
}

/**
 * Parses the raw HTML string containing the student attendance table.
 * @param htmlString - The raw HTML content.
 * @returns Array of AttendanceRecord objects.
 */
export function parseAttendance(htmlString: string): AttendanceRecord[] {
  const $ = cheerio.load(htmlString);
  const records: AttendanceRecord[] = [];

  // Select rows inside the table within the #getStudentDetails div
  const rows = $("#getStudentDetails table tr");

  rows.each((index, element) => {
    const cols = $(element).find("td");

    // Skip headers (th) and summary rows (colspan used for "Total Credits")
    if (cols.length < 13) return;

    // Helper to extract clean text from a specific column index
    const getText = (i: number) => $(cols[i]).text().trim();

    // 1. Parse Faculty Details (Col Index 5)
    // Structure: <p>ID</p> <p>NAME</p> <p>SCHOOL</p>
    const facultyCell = $(cols[5]);
    const facultyPs = facultyCell.find("p");
    const faculty = {
      id: $(facultyPs[0]).text().trim(),
      name: $(facultyPs[1]).text().trim(),
      school: $(facultyPs[2]).text().trim(),
    };

    // 2. Extract Class ID from the "View" button (Col Index 13)
    // Format: processViewAttendanceDetail('CH2025260501008','TG1');
    const viewButtonHtml = $(cols[13]).html() || "";
    const classIdMatch = viewButtonHtml.match(/processViewAttendanceDetail\('([^']+)'/);
    const classId = classIdMatch ? classIdMatch[1] : "";

    // 3. Construct the record object
    const record: AttendanceRecord = {
      slNo: parseInt(getText(0), 10) || 0,
      courseCode: getText(1),
      courseTitle: getText(2),
      courseType: getText(3),
      slot: getText(4),
      faculty: faculty,
      attendanceType: getText(6),
      registrationDate: getText(7),
      attendanceDate: getText(8),
      attendedClasses: parseInt(getText(9), 10) || 0,
      totalClasses: parseInt(getText(10), 10) || 0,
      attendancePercentage: parseInt(getText(11), 10) || 0,
      status: getText(12),
      classId: classId,
    };

    records.push(record);
  });

  return records;
}
