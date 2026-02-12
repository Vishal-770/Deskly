import VTOPClient from "@/lib/electron-utils/AxiosClient";
import { getAuthTokens, getSemesterInfo } from "../auth/StoreAuth.service";
import { handleAuthErrorAndRetry } from "../system/ErrorHandler.service";
import { extractSemesters } from "@/lib/electron-utils/parsers/SemesterParser";
import { Semester } from "@/types/electron/Semster.types";
import { parseTimetableCourses } from "@/lib/electron-utils/parsers/TimeTableParser";
import { generateWeeklySchedule } from "@/lib/electron-utils/FormatTimetable";
import { WeeklySchedule } from "@/types/electron/TimeTable.types";
import { CourseDetails } from "@/types/electron/Course.types";
export async function getSemesters(): Promise<{
  success: boolean;
  semesters?: Semester[];
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
      "/vtop/academics/common/StudentTimeTableChn",
      new URLSearchParams({
        verifyMenu: "true",
        authorizedID: tokens.authorizedID,
        _csrf: tokens.csrf,
        nocache: new Date().getTime().toString(),
      }),
      {
        headers: {
          Cookie: tokens.cookies,
          "Content-Type": "application/x-www-form-urlencoded",
          Referer: "https://vtopcc.vit.ac.in/vtop/content",
        },
      },
    );

    const semesters: Semester[] = extractSemesters(res.data);

    return {
      success: true,
      semesters,
    };
  } catch (err: unknown) {
    try {
      return await handleAuthErrorAndRetry(err, () => getSemesters());
    } catch (handledErr) {
      console.error("Get semesters error:", handledErr);
      return {
        success: false,
        error:
          handledErr instanceof Error ? handledErr.message : String(handledErr),
      };
    }
  }
}

export async function getCurrentSemesterCourses(): Promise<{
  success: boolean;
  data?: CourseDetails[];
  error?: string;
}> {
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
    "/vtop/processViewTimeTable",
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
  // console.log("TimeTable Response:", res.data);
  // console.log("Parsed Courses:",parseTimetableCourses(res.data));
  // console.log(generateWeeklySchedule(parseTimetableCourses(res.data)));
  return {
    success: true,
    data: parseTimetableCourses(res.data),
  };
}
export async function getCurrentSemesterTimeTable(): Promise<{
  success: boolean;
  data?: WeeklySchedule;
  error?: string;
}> {
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
    "/vtop/processViewTimeTable",
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
  // console.log("TimeTable Response:", res.data);
  // console.log("Parsed Courses:",parseTimetableCourses(res.data));
  // console.log(generateWeeklySchedule(parseTimetableCourses(res.data)));
  return {
    success: true,
    data: generateWeeklySchedule(parseTimetableCourses(res.data)),
  };
}
