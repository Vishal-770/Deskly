import VTOPClient from "@/lib/electron/AxiosClient";
import { getAuthTokens, getSemesterInfo } from "../auth/StoreAuth.service";
import { handleAuthErrorAndRetry } from "../system/ErrorHandler.service";
import {
  parseSemesterMonths,
  SemesterMonth,
} from "@/lib/electron/parsers/TimeTableMonth.parser";
import {
  parseSimpleAttendance,
  MonthlySchedule,
} from "@/lib/electron/parsers/AcademicCalendar.parser";

type AcademicCalendarResponse =
  | { success: true; data: SemesterMonth[] }
  | { success: false; error: string };
type CalendarViewResponse =
  | { success: true; data: MonthlySchedule }
  | { success: false; error: string };

export async function getAcademicCalendarService(): Promise<AcademicCalendarResponse> {
  // console.log("getAcademicCalendarService called");
  try {
    const authTokens = getAuthTokens();
    // console.log("Auth tokens:", authTokens ? "found" : "not found");
    if (!authTokens) {
      throw new Error("No auth tokens found");
    }

    const { authorizedID, cookies, csrf } = authTokens;
    // console.log(
    //   "Auth data - authorizedID:",
    //   authorizedID,
    //   "csrf length:",
    //   csrf.length,
    // );

    // Get current semester for semSubId
    const semesterInfo = getSemesterInfo();
    // console.log("Semester info:", semesterInfo);
    if (!semesterInfo) {
      throw new Error("No semester info found");
    }

    const client = VTOPClient();
    // console.log("Making API request with semSubId:", semesterInfo.id);

    const response = await client.post(
      "/vtop/getDateForSemesterPreview",
      new URLSearchParams({
        _csrf: csrf,
        paramReturnId: "getDateForSemesterPreview",
        semSubId: semesterInfo.id,
        authorizedID,
      }).toString(),
      {
        headers: {
          Cookie: cookies,
          "Content-Type": "application/x-www-form-urlencoded",
          "X-Requested-With": "XMLHttpRequest",
        },
      },
    );

    // console.log("API response status:", response.status);
    // console.log("Response data length:", response.data?.length);
    const parsedData = parseSemesterMonths(response.data);
    // console.log(parsedData);

    return {
      success: true,
      data: parsedData,
    };
  } catch (err: unknown) {
    try {
      return await handleAuthErrorAndRetry(err, () =>
        getAcademicCalendarService(),
      );
    } catch (handledErr) {
      console.error("Get academic calendar error:", handledErr);
      return {
        success: false,
        error:
          handledErr instanceof Error ? handledErr.message : String(handledErr),
      };
    }
  }
}

export async function getCalendarViewService(
  calDate: string,
): Promise<CalendarViewResponse> {
  // console.log("getCalendarViewService called with calDate:", calDate);
  try {
    const authTokens = getAuthTokens();
    // console.log("Auth tokens:", authTokens ? "found" : "not found");
    if (!authTokens) {
      throw new Error("No auth tokens found");
    }

    const { authorizedID, cookies, csrf } = authTokens;
    // console.log("_csrf:", csrf);

    // Get current semester for semSubId
    const semesterInfo = getSemesterInfo();
    // console.log("Semester info:", semesterInfo);
    if (!semesterInfo) {
      throw new Error("No semester info found");
    }

    const client = VTOPClient();

    const response = await client.post(
      "/vtop/processViewCalendar",
      new URLSearchParams({
        _csrf: csrf,
        calDate,
        semSubId: semesterInfo.id,
        classGroupId: "COMB",
        authorizedID,
      }).toString(),
      {
        headers: {
          Cookie: cookies,
          "Content-Type": "application/x-www-form-urlencoded",
          "X-Requested-With": "XMLHttpRequest",
        },
      },
    );

    // console.log("API response status:", response.status);
    // console.log("Response data length:", response.data);
    // console.log("HTML preview:", response.data.substring(0, 1000));
    let parsedCalendar;
    try {
      parsedCalendar = parseSimpleAttendance(response.data);
    } catch (parseErr) {
      console.error("Parsing error:", parseErr);
      return {
        success: false,
        error: "Failed to parse calendar data",
      };
    }
    // console.log("Parsed calendar:", parsedCalendar);

    return {
      success: true,
      data: parsedCalendar,
    };
  } catch (err: unknown) {
    try {
      return await handleAuthErrorAndRetry(err, () =>
        getCalendarViewService(calDate),
      );
    } catch (handledErr) {
      console.error("Get calendar view error:", handledErr);
      return {
        success: false,
        error:
          handledErr instanceof Error ? handledErr.message : String(handledErr),
      };
    }
  }
}
