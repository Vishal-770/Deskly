import VTOPClient from "@/lib/electron-utils/AxiosClient";
import { getAuthTokens, getSemesterInfo } from "../auth/StoreAuth.service";
import { handleAuthErrorAndRetry } from "../system/ErrorHandler.service";
import {
  parseAttendance,
  AttendanceRecord,
} from "@/lib/electron-utils/parsers/ParseAttendance";
export async function getCurrentSemesterAttendance(): Promise<{
  success: boolean;
  data?: AttendanceRecord[];
  error?: string;
}> {
  try {
    const semester = await getSemesterInfo();
    if (!semester) {
      return {
        success: false,
        error: "No semester info found",
      };
    }

    const tokens = getAuthTokens();
    if (!tokens) {
      return {
        success: false,
        error: "No auth tokens found",
      };
    }

    const client = VTOPClient();
    const res = await client.post(
      "/vtop/processViewStudentAttendance",
      new URLSearchParams({
        authorizedID: tokens.authorizedID,
        _csrf: tokens.csrf,
        semesterSubId: semester.id,
        x: new Date().toUTCString(),
      }),
      {
        headers: {
          Cookie: tokens.cookies,
          "Content-Type": "application/x-www-form-urlencoded",
          Referer: "https://vtopcc.vit.ac.in/vtop/content",
        },
      },
    );

    return {
      success: true,
      data: parseAttendance(res.data),
    };
  } catch (err: unknown) {
    try {
      return await handleAuthErrorAndRetry(err, () =>
        getCurrentSemesterAttendance(),
      );
    } catch (handledErr) {
      console.error("Get attendance error:", handledErr);
      return {
        success: false,
        error:
          handledErr instanceof Error ? handledErr.message : String(handledErr),
      };
    }
  }
}
