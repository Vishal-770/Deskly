import VTOPClient from "@/lib/electron-utils/AxiosClient";
import { handleAuthErrorAndRetry } from "../system/ErrorHandler.service";

type LogoutResponse = { success: true } | { success: false; error: string };

export async function logoutUser(
  cookies: string,
  authorizedID: string,
  csrf: string,
): Promise<LogoutResponse> {
  try {
    const client = VTOPClient();

    await client.post(
      "/vtop/logout",
      new URLSearchParams({
        _csrf: csrf,
        authorizedID,
      }),
      {
        headers: {
          Cookie: cookies,
          "Content-Type": "application/x-www-form-urlencoded",
          Referer: "https://vtopcc.vit.ac.in/vtop/content",
        },
      },
    );

    return {
      success: true,
    };
  } catch (err: unknown) {
    try {
      return await handleAuthErrorAndRetry(err, () =>
        logoutUser(cookies, authorizedID, csrf),
      );
    } catch (handledErr) {
      console.error("Logout error:", handledErr);
      return {
        success: false,
        error:
          handledErr instanceof Error ? handledErr.message : String(handledErr),
      };
    }
  }
}
