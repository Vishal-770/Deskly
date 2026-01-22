import VTOPClient from "../../lib/electron/axios.client";
import * as cheerio from "cheerio";

export interface CourseAttendance {
  index: number;
  code: string;
  name: string;
  type: string;
  attendance: number;
  remark: string;
}

export interface SemesterAttendance {
  semester: string;
  courses: CourseAttendance[];
}

export interface CGPAData {
  totalCreditsRequired: number;
  earnedCredits: number;
  currentCGPA: number;
  nonGradedCore: number;
}

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

export async function getContentPage(
  cookies: string,
  authorizedID?: string,
  csrf?: string,
) {
  try {
    const client = VTOPClient();

    const contentRes = await client.post(
      "/vtop/get/dashboard/current/semester/course/details",
      new URLSearchParams({
        authorizedID: authorizedID || "",
        _csrf: csrf || "",
        x: new Date().toUTCString(), // Current timestamp in RFC 2822 format
      }),
      {
        headers: {
          Cookie: cookies,
          "Content-Type": "application/x-www-form-urlencoded",
          Referer: "https://vtopcc.vit.ac.in/vtop/content",
        },
      },
    );

    // Parse the HTML using the improved extraction function
    const attendanceData = await extractAttendanceFromHTML(contentRes.data);

    console.log("Parsed attendance data:", attendanceData);

    return {
      success: true,
      courses: attendanceData.courses,
      semester: attendanceData.semester,
    };
  } catch (err: unknown) {
    console.error(err);
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export async function extractCGPAFromHTML(html: string): Promise<CGPAData> {
  const $ = cheerio.load(html);

  const data: CGPAData = {
    totalCreditsRequired: 0,
    earnedCredits: 0,
    currentCGPA: 0,
    nonGradedCore: 0,
  };

  // Find the list items
  $(".list-group-item").each((_, item) => {
    const spans = $(item).find("span");
    if (spans.length >= 2) {
      const label = $(spans[0]).text().trim();
      const valueText = $(spans[1]).find("span").text().trim();
      const value = parseFloat(valueText);

      if (label.includes("Total Credits Required")) {
        data.totalCreditsRequired = value;
      } else if (label.includes("Earned Credits")) {
        data.earnedCredits = value;
      } else if (label.includes("Current CGPA")) {
        data.currentCGPA = value;
      } else if (label.includes("Non-graded Core Requirement")) {
        data.nonGradedCore = value;
      }
    }
  });

  return data;
}

export async function getCGPAPage(
  cookies: string,
  authorizedID?: string,
  csrf?: string,
) {
  try {
    const client = VTOPClient();

    const cgpaRes = await client.post(
      "/vtop/get/dashboard/current/cgpa/credits",
      new URLSearchParams({
        authorizedID: authorizedID || "",
        _csrf: csrf || "",
        x: new Date().toUTCString(),
      }),
      {
        headers: {
          Cookie: cookies,
          "Content-Type": "application/x-www-form-urlencoded",
          Referer: "https://vtopcc.vit.ac.in/vtop/content",
        },
      },
    );

    let html = cgpaRes.data;
    try {
      const json = JSON.parse(cgpaRes.data);
      if (json.html) {
        html = json.html;
      }
    } catch {}

    const cgpaData = await extractCGPAFromHTML(html);

    console.log("Parsed CGPA data:", cgpaData);

    return {
      success: true,
      cgpaData,
    };
  } catch (err: unknown) {
    console.error(err);
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
