import VTOPClient from "../../lib/electron/axios.client";
import { getAuthTokens, getSemesterInfo } from "./storeAuth.service";
import { handleAuthErrorAndRetry } from "./errorHandler";
import {
  parseFeedbackStatus,
  FeedbackStatus,
} from "../../lib/electron/parsers/ParseFeedbackInfo";
export async function getFeedbackStatus(): Promise<{
  success: boolean;
  data?: FeedbackStatus[];
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

    const semester = getSemesterInfo();
    if (!semester) {
      return {
        success: false,
        error: "No semester selected",
      };
    }

    const client = VTOPClient();

    const res = await client.post(
      "/vtop/processViewFeedBackStatus",
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

    const parsedData = parseFeedbackStatus(res.data);
    return {
      success: true,
      data: parsedData,
    };
  } catch (err: unknown) {
    try {
      return await handleAuthErrorAndRetry(err, () => getFeedbackStatus());
    } catch (retryErr: unknown) {
      return {
        success: false,
        error: retryErr instanceof Error ? retryErr.message : "Unknown error",
      };
    }
  }
}
