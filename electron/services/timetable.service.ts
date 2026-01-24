import VTOPClient from "../../lib/electron/axios.client";
import { getAuthTokens } from "./storeAuth.service";
import { handleAuthErrorAndRetry } from "./errorHandler";
import { extractSemesters } from "../../lib/electron/parsers/SemesterParser";
import { Semester } from "@/types/electron/Semster.types";
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
      return await handleAuthErrorAndRetry(err, async (newTokens) => {
        // Tokens are updated after relogin, but we fetch from store anyway
        return getSemesters();
      });
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
