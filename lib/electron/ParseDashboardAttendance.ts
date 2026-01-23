import {
  CourseAttendance,
  SemesterAttendance,
} from "@/electron/services/content.service";
import * as cheerio from "cheerio";
export async function extractAttendanceFromHTML(
  html: string,
): Promise<SemesterAttendance> {
  const $ = cheerio.load(html);

  // 🔹 Extract semester text (dynamic)
  const semester = $(".card-header span.bg-warning").first().text().trim();

  const courses: CourseAttendance[] = [];

  // 🔹 Loop over each table row
  $("table tbody tr").each((_, row) => {
    const cells = $(row).find("td");

    if (cells.length < 4) return;

    // Course Code
    const code = $(cells[0]).find("span.fw-bold").first().text().trim();

    // Course Name
    const name = $(cells[0]).find("span").last().text().trim();

    // Course Type (TH / LO / ELA / etc.)
    const type = $(cells[1]).text().trim();

    // Attendance (number only)
    const attendanceText = $(cells[2]).text().trim();
    const attendance = parseFloat(attendanceText);

    // Remark
    const remark = $(cells[3]).text().trim();

    courses.push({
      index: courses.length + 1,
      code,
      name,
      type,
      attendance: isNaN(attendance) ? 0 : attendance,
      remark,
    });
  });

  return {
    semester,
    courses,
  };
}
