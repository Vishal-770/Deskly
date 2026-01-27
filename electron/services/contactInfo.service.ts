import VTOPClient from "../../lib/electron/axios.client";
import { getAuthTokens } from "./storeAuth.service";
import { parseContactDetails } from "../../lib/electron/parsers/contactInfo.parser";
import { ContactInfoResponse } from "@/types/electron/contactInfo.types";
import { handleAuthErrorAndRetry, AuthTokens } from "./errorHandler";

export async function getContactInfo(
  tokens?: AuthTokens,
): Promise<ContactInfoResponse> {
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

    const contactRes = await client.post(
      "/vtop/hrms/contactDetails",
      new URLSearchParams({
        verifyMenu: "true",
        authorizedID,
        _csrf: csrf,
        nocache: `@${new Date().getTime()}`,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          Cookie: cookies,
        },
      },
    );
    // console.log("Contact Info Response:", parseContactDetails(contactRes.data));
    return {
      success: true,
      data: parseContactDetails(contactRes.data),
    };
  } catch (err: unknown) {
    try {
      return await handleAuthErrorAndRetry(err, () => getContactInfo());
    } catch (handledErr) {
      console.error("Get contact info error:", handledErr);
      return {
        success: false,
        error:
          handledErr instanceof Error ? handledErr.message : String(handledErr),
      };
    }
  }
}
