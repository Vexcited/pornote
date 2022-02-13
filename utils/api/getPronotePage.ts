import request from "@/apiUtils/request";
import { HTTPError } from "got";

/**
 * Fetch a Pronote page.
 * @param pronoteUrl - URL to fetch.
 * - It must be a Pronote URL and may look
 * like this `https://xxxxx.index-education.net/pronote/accountPath.html`.
 * @param cookies - Cookies to send with the request.
 * - When a login cookie is provided, the request will provide another
 * cookie that will be used on next login.
 * @returns
 * - `[0]: boolean`: Request succeeded or not.
 * - `[1]: string`: Body of the Pronote page OR error message if `[0]` is false.
 * - `[2]: string[]`: Login cookies when using ENT or restoring a session.
 */
async function getPronotePage (
  pronoteUrl: string, cookie?: string
): Promise<[boolean, string, string?]> {
  try {
    const { body, headers } = await request().get(pronoteUrl, {
      followRedirect: false, // Bypass ENT redirection.
      headers: {
        // Append cookies to the request.
        "Cookie": cookie
      }
    });

    // Login cookies when using ENT or restoring a session.
    const loginCookies = headers["set-cookie"];
    const loginCookie = loginCookies ? loginCookies[0] : undefined;

    return [true, body, loginCookie];
  }
  catch (e) {
    const error = e as HTTPError;
    return [false, error.message];
  }
}

export default getPronotePage;
