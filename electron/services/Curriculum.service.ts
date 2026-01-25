import VTOPClient from "../../lib/electron/axios.client";
import {
  extractCategories,
  parseCourseTable,
  Category,
  CourseEntry,
} from "../../lib/electron/parsers/Curriculum.parser";
import { getAuthTokens } from "./storeAuth.service";
import { handleAuthErrorAndRetry, AuthTokens } from "./errorHandler";

export interface CurriculumResponse {
  success: boolean;
  data?: Category[];
  html?: string;
  error?: string;
}

export interface CurriculumCategoryResponse {
  success: boolean;
  data?: CourseEntry[];
  html?: string;
  error?: string;
}

export interface SyllabusDownloadResponse {
  success: boolean;
  data?: ArrayBuffer;
  filename?: string;
  contentType?: string;
  error?: string;
}

export async function getCurriculum(
  tokens?: AuthTokens,
): Promise<CurriculumResponse> {
  try {
    const authTokens = tokens || getAuthTokens();
    if (!authTokens) {
      return {
        success: false,
        error: "No auth tokens found",
      };
    }

    const { cookies, authorizedID, csrf } = authTokens;

    const client = VTOPClient();

    const curriculumRes = await client.post(
      "/vtop/academics/common/Curriculum",
      new URLSearchParams({
        verifyMenu: "true",
        authorizedID,
        _csrf: csrf,
        nocache: `@${new Date().getTime()}`,
      }),
      {
        headers: {
          Cookie: cookies,
          "Content-Type": "application/x-www-form-urlencoded",
          Referer: "https://vtopcc.vit.ac.in/vtop/content",
        },
      },
    );

    const categories = extractCategories(curriculumRes.data);

    return {
      success: true,
      data: categories,
      html: curriculumRes.data,
    };
  } catch (err: unknown) {
    try {
      return await handleAuthErrorAndRetry(err, () => getCurriculum());
    } catch (handledErr) {
      console.error("Get curriculum error:", handledErr);
      return {
        success: false,
        error:
          handledErr instanceof Error ? handledErr.message : String(handledErr),
      };
    }
  }
}

export async function getCurriculumCategoryView(
  categoryId: string,
  tokens?: AuthTokens,
): Promise<CurriculumCategoryResponse> {
  try {
    const authTokens = tokens || getAuthTokens();
    if (!authTokens) {
      return {
        success: false,
        error: "No auth tokens found",
      };
    }

    const { cookies, authorizedID, csrf } = authTokens;

    const client = VTOPClient();

    const categoryRes = await client.post(
      "/vtop/academics/common/curriculumCategoryView",
      new URLSearchParams({
        _csrf: csrf,
        categoryId,
        authorizedID,
        nocache: `@${new Date().getTime()}`,
      }),
      {
        headers: {
          Cookie: cookies,
          "Content-Type": "application/x-www-form-urlencoded",
          Referer: "https://vtopcc.vit.ac.in/vtop/content",
        },
      },
    );

    const courses = parseCourseTable(categoryRes.data);

    return {
      success: true,
      data: courses,
      html: categoryRes.data,
    };
  } catch (err: unknown) {
    try {
      return await handleAuthErrorAndRetry(err, () =>
        getCurriculumCategoryView(categoryId),
      );
    } catch (handledErr) {
      console.error("Get curriculum category view error:", handledErr);
      return {
        success: false,
        error:
          handledErr instanceof Error ? handledErr.message : String(handledErr),
      };
    }
  }
}

export async function downloadCourseSyllabus(
  courseCode: string,
  tokens?: AuthTokens,
): Promise<SyllabusDownloadResponse> {
  try {
    const authTokens = tokens || getAuthTokens();
    if (!authTokens) {
      return {
        success: false,
        error: "No auth tokens found",
      };
    }

    const { cookies, authorizedID, csrf } = authTokens;

    const client = VTOPClient();

    const response = await client.post(
      "/vtop/courseSyllabusDownload1",
      new URLSearchParams({
        _csrf: csrf,
        authorizedID,
        courseCode,
      }),
      {
        headers: {
          Cookie: cookies,
          "Content-Type": "application/x-www-form-urlencoded",
          Referer: "https://vtopcc.vit.ac.in/vtop/content",
        },
        responseType: "arraybuffer", // For binary data
      },
    );

    // Get filename from content-disposition header
    const contentDisposition = response.headers["content-disposition"];
    let filename = `course_${courseCode}.zip`; // fallback

    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="([^"]+)"/);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }

    return {
      success: true,
      data: response.data, // binary data
      filename,
      contentType: response.headers["content-type"],
    };
  } catch (err: unknown) {
    try {
      return await handleAuthErrorAndRetry(err, () =>
        downloadCourseSyllabus(courseCode),
      );
    } catch (handledErr) {
      console.error("Download course syllabus error:", handledErr);
      return {
        success: false,
        error:
          handledErr instanceof Error ? handledErr.message : String(handledErr),
      };
    }
  }
}
