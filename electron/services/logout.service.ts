import VTOPClient from "../../lib/electron/axios.client";

export async function logoutUser(
  cookies: string,
  authorizedID: string,
  csrf: string,
) {
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
    console.error("Logout error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
