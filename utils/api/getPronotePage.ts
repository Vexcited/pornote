import { api } from "@/apiUtils/request";
import { HTTPError } from "got";

type GetPronotePageSuccess = {
  success: true;
  /**
   * Cookie given by Pronote for authentification when
   * restoring a session or using ENT.
   */
  loginCookie?: string;
  /** Body of the Pronote page. */
  body: string;
}

type GetPronotePageFail = {
  success: false,
  message: string;

  /** Body of Pronote response if `HTTPError`. */
  body?: any;
}

/**
 * Fetch a Pronote page.
 * @param pronoteUrl - Pronote URL to fetch.
 * @param cookie - Cookies to send with the request (separated by `;`).
 * - When a login cookie is provided, the request will provide another
 * cookie that will be used on next login.
 */
async function getPronotePage (
  pronoteUrl: string, cookie?: string
): Promise<GetPronotePageSuccess | GetPronotePageFail> {
  try {
    const { body, headers } = await api.get(pronoteUrl, {
      followRedirect: false, // Bypass ENT redirection.
      headers: {
        // Append cookies to the request.
        "Cookie": cookie
      }
    });

    // Login cookies when using ENT or restoring a session.
    const loginCookies = headers["set-cookie"];
    const loginCookie = loginCookies ? loginCookies[0] : undefined;

    return {
      success: true,
      loginCookie,
      body
    };
  }
  catch (e) {
    if (e instanceof HTTPError) {
      const body = e.response.body;

      return {
        success: false,
        message: "Erreur lors de la requête.",
        body
      };
    }

    return {
      success: false,
      message: "Erreur inconnue"
    };
  }
}

export default getPronotePage;
