import type { FetchEntProps } from "./";

import got, { HTTPError, MaxRedirectsError } from "got";

/** Connection for OpenENT. */
export async function connect ({
  url,
  username,
  password,
  cookies,
  onlyEntCookies
}: FetchEntProps): Promise<[boolean, string | string[]]> {

  // Determine the callback URL.
  let service = "";
  if (!onlyEntCookies) {
    const callbackParam = new URL(url).searchParams.get("callback") as string;
    const callbackValue = decodeURIComponent(callbackParam);
    service = callbackValue.substring(callbackValue.indexOf("=") + 1);
  }

  try {
    const hostname = new URL(url).hostname;
    const { headers } = await got({
      followRedirect: !onlyEntCookies,
      prefixUrl: `https://${hostname}`,
      ...(onlyEntCookies
        // To get the login cookies from OpenENT, we send a POST
        // request to /auth/login and grab the cookies sent.
        ? {
          url: "auth/login",
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            email: username as string,
            password: password as string,
            rememberMe: "true" // Keep cookies in local.
          }).toString()
        }

        // To get Pronote ticket cookie, we should send a GET
        // request to /cas/login with the cookies we got previously
        // using 'onlyEntCookies': true.
        : {
          maxRedirects: 1,
          url: "cas/login",
          method: "GET",
          headers: { "Cookie": (cookies as string[]).join("; ") },
          searchParams: {
            service
          }
        }
      )
    });

    // Grab the cookies sent and parse them.
    const responseCookies = headers["set-cookie"] || [];
    const parsedCookies = responseCookies.map(cookie => cookie.split(";")[0]);

    return [true, onlyEntCookies ? parsedCookies : headers["location"] as string];
  }
  catch (e) {
    // If the login is successful and it redirects to the Pronote
    // ticket, get the redirected URL (for 'identifiant' parsing).
    if (e instanceof MaxRedirectsError) {
      return [true, e.response.headers["location"] as string];
    }
    else if (e instanceof HTTPError) {
      return [false, e.message];
    }
    else {
      console.error(e);
      return [false, "An error occurred, please fill an issue on GitHub."];
    }
  }
}