import VTOPClient from "../../lib/electron/axios.client";
import { parseStudentHtml } from "../../lib/electron/parseProfileInfo";
export async function getStudentProfile(
  cookies: string,
  authorizedID: string,
  csrf: string,
) {
  try {
    const client = VTOPClient();

    const profileRes = await client.post(
      "/vtop/studentsRecord/StudentProfileAllView",
      new URLSearchParams({
        verifyMenu: "true",
        authorizedID,
        _csrf: csrf,
        nocache: `@${new Date().getTime()}`,
      }),
      {
        headers: {
          Cookie: cookies,
          "Content-Type": "application/x-www-form-urlencoded",
          Referer: "https://vtopcc.vit.ac.in/vtop/content",
        },
      },
    );
    const result = parseStudentHtml(profileRes.data);
    // console.log("Profile fetch status:-------------------------");
    // // console.log(profileRes.data.status);
    return {
      success: true,
      data: result,
      html: profileRes.data,
    };
  } catch (err: unknown) {
    console.error(err);
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
