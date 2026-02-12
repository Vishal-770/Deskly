import VTOPClient from "@/lib/electron-utils/AxiosClient";
import { handleAuthErrorAndRetry } from "../system/ErrorHandler.service";
import {
  parseStudentProfile,
  ImportantProfileData,
} from "@/lib/electron-utils/ParseProfileInfo";

type ProfileResponse =
  | { success: true; data: ImportantProfileData; html: string }
  | { success: false; error: string };

export async function getStudentProfile(
  cookies: string,
  authorizedID: string,
  csrf: string,
): Promise<ProfileResponse> {
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
    const result = parseStudentProfile(profileRes.data);
    // console.log("Profile fetch status:-------------------------");
    // // console.log(profileRes.data.status);
    // console.log(result);
    return {
      success: true,
      data: result,
      html: profileRes.data,
    };
  } catch (err: unknown) {
    try {
      return await handleAuthErrorAndRetry(err, () =>
        getStudentProfile(cookies, authorizedID, csrf),
      );
    } catch (handledErr) {
      console.error("Get student profile error:", handledErr);
      return {
        success: false,
        error:
          handledErr instanceof Error ? handledErr.message : String(handledErr),
      };
    }
  }
}
