import VTOPClient from "../../lib/electron/axios.client";
import { getAuthTokens } from "../services/storeAuth.service";
import { handleAuthErrorAndRetry, AuthTokens } from "./errorHandler";

export async function getUserImage(tokens?: AuthTokens): Promise<{
  success: boolean;
  image?: string;
  contentType?: string;
  error?: string;
}> {
  try {
    const authTokens = tokens || getAuthTokens();
    if (!authTokens) {
      return {
        success: false,
        error: "No auth tokens found",
      };
    }

    const client = VTOPClient();

    const res = await client.get(
      "/vtop/users/image/?id=" + authTokens.authorizedID,
      {
        headers: {
          Cookie: authTokens.cookies,
          Referer: "https://vtopcc.vit.ac.in/vtop/content",
        },
        responseType: "arraybuffer",
      },
    );

    return {
      success: true,
      image: Buffer.from(res.data).toString("base64"),
      contentType: res.headers["content-type"] || "image/png",
    };
  } catch (err: unknown) {
    try {
      return await handleAuthErrorAndRetry(err, (newTokens) =>
        getUserImage(newTokens),
      );
    } catch (handledErr) {
      console.error("Get user image error:", handledErr);
      return {
        success: false,
        error:
          handledErr instanceof Error ? handledErr.message : String(handledErr),
      };
    }
  }
}
