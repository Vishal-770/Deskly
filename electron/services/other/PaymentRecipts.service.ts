import VTOPClient from "@/lib/electron-utils/AxiosClient";
import { handleAuthErrorAndRetry } from "../system/ErrorHandler.service";
import { getAuthTokens } from "../auth/StoreAuth.service";
import {
  parseReceipts,
  Receipt,
} from "@/lib/electron-utils/parsers/PaymentRecipts.parser";

export async function getPaymentReceipts(): Promise<{
  success: boolean;
  data?: Receipt[];
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

    const receiptsRes = await client.post(
      "/vtop/p2p/getReceiptsApplno",
      new URLSearchParams({
        verifyMenu: "true",
        authorizedID: tokens.authorizedID,
        _csrf: tokens.csrf,
        nocache: "@(new Date().getTime())",
      }),
      {
        headers: {
          Cookie: tokens.cookies,
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          Referer: "https://vtopcc.vit.ac.in/vtop/content",
          "X-Requested-With": "XMLHttpRequest",
        },
      },
    );

    const parsedData = parseReceipts(receiptsRes.data);

    return {
      success: true,
      data: parsedData,
    };
  } catch (err: unknown) {
    try {
      return await handleAuthErrorAndRetry(err, () => getPaymentReceipts());
    } catch (handledErr) {
      console.error("Error fetching payment receipts:");
      return {
        success: false,
        error:
          handledErr instanceof Error ? handledErr.message : String(handledErr),
      };
    }
  }
}
