import VTOPClient from "../../lib/electron/axios.client";
import { getAuthTokens, getSemesterInfo } from "./storeAuth.service";
import { parseSemesterMonths } from "../../lib/electron/parsers//timeTableMonth.parser";
import { parseSimpleAttendance } from "../../lib/electron/parsers/academicCalender.parser";

export async function getAcademicCalendarService() {
  console.log("getAcademicCalendarService called");
  try {
    const authTokens = getAuthTokens();
    console.log("Auth tokens:", authTokens ? "found" : "not found");
    if (!authTokens) {
      throw new Error("No auth tokens found");
    }

    const { authorizedID, cookies, csrf } = authTokens;
    console.log(
      "Auth data - authorizedID:",
      authorizedID,
      "csrf length:",
      csrf.length,
    );

    // Get current semester for semSubId
    const semesterInfo = getSemesterInfo();
    console.log("Semester info:", semesterInfo);
    if (!semesterInfo) {
      throw new Error("No semester info found");
    }

    const client = VTOPClient();
    console.log("Making API request with semSubId:", semesterInfo.id);

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

    console.log("API response status:", response.status);
    console.log("Response data length:", response.data?.length);
    const parsedData = parseSemesterMonths(response.data);
    console.log(parsedData);

    return {
      success: true,
      data: parsedData,
    };
  } catch (err: unknown) {
    console.error("Error in getAcademicCalendarService:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export async function getCalendarViewService(calDate: string) {
  console.log("getCalendarViewService called with calDate:", calDate);
  try {
    const authTokens = getAuthTokens();
    console.log("Auth tokens:", authTokens ? "found" : "not found");
    if (!authTokens) {
      throw new Error("No auth tokens found");
    }

    const { authorizedID, cookies, csrf } = authTokens;
    console.log("_csrf:", csrf);

    // Get current semester for semSubId
    const semesterInfo = getSemesterInfo();
    console.log("Semester info:", semesterInfo);
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

    console.log("API response status:", response.status);
    console.log("Response data length:", response.data);
    console.log("HTML preview:", response.data.substring(0, 1000));
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
    console.log("Parsed calendar:", parsedCalendar);

    return {
      success: true,
      data: parsedCalendar,
    };
  } catch (err: unknown) {
    console.error("Error in getCalendarViewService:", err);
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : err
            ? String(err)
            : "Unknown error",
    };
  }
}
