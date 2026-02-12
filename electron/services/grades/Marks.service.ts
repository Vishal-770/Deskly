import VTOPClient from "@/lib/electron-utils/AxiosClient";
import { getAuthTokens } from "../auth/StoreAuth.service";
import { handleAuthErrorAndRetry } from "../system/ErrorHandler.service";
import { parseStudentMarks } from "@/lib/electron-utils/parsers/MarksParser.parser";
import { StudentMarkEntry } from "@/types/electron/marks.types";

export async function getStudentMarkView(semesterSubId: string): Promise<{
  success: boolean;
  data?: StudentMarkEntry[];
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

    const formData = new FormData();
    formData.append("authorizedID", tokens.authorizedID);
    formData.append("semesterSubId", semesterSubId);
    formData.append("_csrf", tokens.csrf);

    const res = await client.post(
      "/vtop/examinations/doStudentMarkView",
      formData,
      {
        headers: {
          Cookie: tokens.cookies,
          Referer: "https://vtopcc.vit.ac.in/vtop/content",
        },
      },
    );

    const parsedData = parseStudentMarks(res.data);

    return {
      success: true,
      data: parsedData,
    };
  } catch (err: unknown) {
    try {
      return await handleAuthErrorAndRetry(err, () =>
        getStudentMarkView(semesterSubId),
      );
    } catch (retryErr: unknown) {
      return {
        success: false,
        error: retryErr instanceof Error ? retryErr.message : "Unknown error",
      };
    }
  }
}
