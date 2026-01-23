import VTOPClient from "../../lib/electron/axios.client";
import { getAuthTokens } from "../services/storeAuth.service";

export async function getUserImage() {
  try {
    const tokens = getAuthTokens();
    if (!tokens) {
      return {
        success: false,
        error: "No auth tokens found",
      };
    }

    const client = VTOPClient();

    const res = await client.get(
      "/vtop/users/image/?id=" + tokens.authorizedID,
      {
        headers: {
          Cookie: tokens.cookies,
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
    console.error("Get user image error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
