import VTOPClient from "../../lib/electron/axios.client";
import {
  extractCategories,
  parseCourseTable,
} from "../../lib/electron/parsers/Curriculum.parser";
import { getAuthTokens } from "./storeAuth.service";

export async function getCurriculum() {
  try {
    const tokens = getAuthTokens();
    if (!tokens) {
      return {
        success: false,
        error: "No auth tokens found",
      };
    }

    const { cookies, authorizedID, csrf } = tokens;

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
    console.error(err);
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export async function getCurriculumCategoryView(categoryId: string) {
  try {
    const tokens = getAuthTokens();
    if (!tokens) {
      return {
        success: false,
        error: "No auth tokens found",
      };
    }

    const { cookies, authorizedID, csrf } = tokens;

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
    console.error(err);
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export async function downloadCourseSyllabus(courseCode: string) {
  try {
    const tokens = getAuthTokens();
    if (!tokens) {
      return {
        success: false,
        error: "No auth tokens found",
      };
    }

    const { cookies, authorizedID, csrf } = tokens;

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
    console.error(err);
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
