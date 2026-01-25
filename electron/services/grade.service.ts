import VTOPClient from "../../lib/electron/axios.client";
import { getAuthTokens } from "./storeAuth.service";
import { handleAuthErrorAndRetry } from "./errorHandler";
import {
  parseStudentHistory,
  StudentHistoryData,
} from "../../lib/electron/parsers/grade.htmlparser";

export async function getExamGradeView(): Promise<{
  success: boolean;
  data?: StudentHistoryData;
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
      "/vtop/examinations/examGradeView/StudentGradeHistory",
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

    console.log("Exam Grade View HTML:", res.data);
    const parsedData = parseStudentHistory(res.data);
    console.log("Parsed Grade Data:", parsedData);

    return {
      success: true,
      data: parsedData,
    };
  } catch (err: unknown) {
    try {
      return await handleAuthErrorAndRetry(err, () => getExamGradeView());
    } catch (handledErr) {
      console.error("Get exam grade view error:", handledErr);
      return {
        success: false,
        error:
          handledErr instanceof Error ? handledErr.message : String(handledErr),
      };
    }
  }
}
