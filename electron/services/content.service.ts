import VTOPClient from "../../lib/electron/axios.client";
import { handleAuthErrorAndRetry } from "./errorHandler";
import { extractCGPAFromHTML } from "../../lib/electron/ParseDashboarCgpa";
import { extractAttendanceFromHTML } from "../../lib/electron/ParseDashboardAttendance";

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

export async function getContentPage(
  cookies: string,
  authorizedID?: string,
  csrf?: string,
): Promise<{
  success: boolean;
  courses?: CourseAttendance[];
  semester?: string;
  error?: string;
}> {
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
    console.log("STATUS:", contentRes.status);
    // Parse the HTML using the improved extraction function
    const attendanceData = await extractAttendanceFromHTML(contentRes.data);

    // console.log("Parsed attendance data:", attendanceData);

    return {
      success: true,
      courses: attendanceData.courses,
      semester: attendanceData.semester,
    };
  } catch (err: unknown) {
    try {
      return await handleAuthErrorAndRetry(err, (tokens) =>
        getContentPage(tokens.cookies, tokens.authorizedID, tokens.csrf),
      );
    } catch (handledErr) {
      console.error("Error fetching content page:");
      return {
        success: false,
        error:
          handledErr instanceof Error ? handledErr.message : String(handledErr),
      };
    }
  }
}

export async function getCGPAPage(
  cookies: string,
  authorizedID?: string,
  csrf?: string,
): Promise<{
  success: boolean;
  cgpaData?: CGPAData;
  error?: string;
}> {
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

    // Handle JSON-wrapped HTML
    try {
      const json = JSON.parse(cgpaRes.data);
      if (json?.html) {
        html = json.html;
      }
    } catch {
      // not JSON, ignore
    }

    const cgpaData = await extractCGPAFromHTML(html);

    return {
      success: true,
      cgpaData,
    };
  } catch (err: unknown) {
    try {
      return await handleAuthErrorAndRetry(err, (tokens) =>
        getCGPAPage(tokens.cookies, tokens.authorizedID, tokens.csrf),
      );
    } catch (handledErr) {
      console.error(
        "[CGPA FETCH] Error after handling auth error:",
        handledErr,
      );
      return {
        success: false,
        error:
          handledErr instanceof Error ? handledErr.message : String(handledErr),
      };
    }
  }
}
