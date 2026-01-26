import VTOPClient from "../../lib/electron/axios.client";
import { getAuthTokens } from "./storeAuth.service";
import { handleAuthErrorAndRetry } from "./errorHandler";
import {
  parseAttendanceDetails,
  AttendanceRecord,
} from "../../lib/electron/parsers/ParseAttendacneDetails";
export async function getAttendanceDetail(
  classId: string,
  slotName: string,
): Promise<{
  success: boolean;
  data?: AttendanceRecord[];
  error?: string;
}> {
  try {
    const tokens = getAuthTokens();
    if (!tokens) {
      return {
        success: false,
        error: "No auth tokens found",
      };
    }

    const client = VTOPClient();
    const res = await client.post(
      "/vtop/processViewAttendanceDetail",
      new URLSearchParams({
        authorizedID: tokens.authorizedID,
        _csrf: tokens.csrf,
        classId,
        slotName,
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

    // console.log("Attendance Detail HTML:", parseAttendanceDetails(res.data));

    return {
      success: true,
      data: parseAttendanceDetails(res.data),
    };
  } catch (err: unknown) {
    try {
      return await handleAuthErrorAndRetry(err, () =>
        getAttendanceDetail(classId, slotName),
      );
    } catch (handledErr) {
      console.error("Get attendance detail error:", handledErr);
      return {
        success: false,
        error:
          handledErr instanceof Error ? handledErr.message : String(handledErr),
      };
    }
  }
}
