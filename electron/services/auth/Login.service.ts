import { LoginRequestBody } from "@/types/electron/Captcha.types";

import { getCaptcha } from "../other/GetCaptcha.service";
import { solveCaptcha } from "@/lib/electron/SolveCaptcha";
import * as cheerio from "cheerio";

import VTOPClient from "@/lib/electron/AxiosClient";

export async function loginService(body: LoginRequestBody) {
  try {
    const { username, password } = body;
    const captchaRes = await getCaptcha();
    if ("error" in captchaRes) {
      throw new Error(captchaRes.error);
    }

    const { captchaBase64, cookies, csrf } = captchaRes;
    const captcha = await solveCaptcha(captchaBase64);

    const client = VTOPClient();

    const loginRes = await client.post(
      "/vtop/login",
      new URLSearchParams({
        _csrf: csrf,
        username,
        password,
        captchaStr: captcha,
      }).toString(),
      {
        headers: {
          Cookie: cookies.join("; "),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        maxRedirects: 0,
        validateStatus: (s) => s < 400 || s === 302,
      },
    );

    const loginCookies = loginRes.headers["set-cookie"];
    const allCookies = [...(cookies || []), ...(loginCookies || [])].join("; ");

    let dashboardRes: { data: string };
    if (loginRes.status === 302 && loginRes.headers.location) {
      dashboardRes = await client.get(loginRes.headers.location, {
        headers: { Cookie: allCookies },
      });
    } else {
      dashboardRes = await client.get("/vtop/open/page", {
        headers: { Cookie: allCookies },
      });
    }

    const dashboardHtml = dashboardRes.data;
    let isAuthorized = false;

    if (/authorizedidx/i.test(dashboardHtml)) {
      isAuthorized = true;
    } else if (/invalid\s*captcha/i.test(dashboardHtml)) {
      throw new Error("Invalid Captcha");
    } else if (
      /invalid\s*(user\s*name|login\s*id|user\s*id)\s*\/\s*password/i.test(
        dashboardHtml,
      )
    ) {
      throw new Error("Invalid Username / Password");
    }

    if (!isAuthorized) {
      throw new Error("Login failed for an unknown reason.");
    }

    const $ = cheerio.load(dashboardHtml);
    const new_csrf: string = $('input[name="_csrf"]').val() as string;
    const authorizedID: string =
      ($("#authorizedID").val() as string) ||
      ($('input[name="authorizedid"]').val() as string);

    return {
      success: true,
      message: "Login successful!",
      cookies: allCookies,
      csrf: new_csrf,
      authorizedID,
    };
  } catch (err: unknown) {
    console.error(err);
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
