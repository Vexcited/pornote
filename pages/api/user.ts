import type {
  NextApiRequest,
  NextApiResponse
} from "next";

import type {
  ApiUserResponse,
  ApiServerError
} from "types/ApiData";

import type {
  PronoteApiUserDataStudent
} from "types/PronoteApiData";

import getBasePronoteUrl from "@/apiUtils/getBasePronoteUrl";
import { bodyChecker } from "@/apiUtils/objectChecker";
import { request } from "@/apiUtils/request";

export type ApiUserRequestBody = {
  pronote_url: string;

  // IV for encryption.
  session_encryption_iv: string;
  // Key for encryption.
  session_encryption_key: string;

  /** Account Type ID of the user to authenticate. */
  pronote_account_type_id: number;

  /** Session from Pronote HTML: `parseInt(session.h)` */
  pronote_session_id: number;

  /** **Unencrypted** order to send to Pronote. */
  pronote_session_order: number;

  /** Cookies given when logged in with ENT or re-store session. */
  pronote_cookie?: string;
}

export default async function handler (
  req: NextApiRequest,
  res: NextApiResponse<ApiUserResponse | ApiServerError>
) {
  if (req.method === "POST") {
    const bodyCheckResults = bodyChecker<ApiUserRequestBody>(req, [
      {
        param: "pronote_url",
        type: "string",
        required: true
      },
      {
        param: "session_encryption_iv",
        type: "string",
        required: true
      },
      {
        param: "session_encryption_key",
        type: "string",
        required: true
      },
      {
        param: "pronote_account_type_id",
        type: "number",
        required: true
      },
      {
        param: "pronote_session_id",
        type: "number",
        required: true
      },
      {
        param: "pronote_session_order",
        type: "number",
        required: true
      },
      {
        param: "pronote_cookie",
        type: "string",
        required: false
      }
    ]);

    if (!bodyCheckResults.success) return res.status(401).json({
      success: false,
      message: bodyCheckResults.message
    });

    const body = bodyCheckResults.body;
    const pronoteBaseUrl = getBasePronoteUrl(body.pronote_url);

    const pronoteUserDataResponse = await request<PronoteApiUserDataStudent>({
      pronoteUrl: pronoteBaseUrl,
      sessionId: body.pronote_session_id,
      accountId: body.pronote_account_type_id,
      encryption: {
        aesIv: body.session_encryption_iv,
        aesKey: body.session_encryption_key
      },
      order: body.pronote_session_order,
      name: "ParametresUtilisateur",
      cookie: body.pronote_cookie,
      body: {}
    });

    if (!pronoteUserDataResponse.success) return res.status(401).json({
      success: false,
      message: pronoteUserDataResponse.message,
      debug: pronoteUserDataResponse.debug
    });

    const pronoteLoginCookies = pronoteUserDataResponse.headers["set-cookie"];

    res.status(200).json({
      success: true,
      request: pronoteUserDataResponse,
      pronoteLoginCookie: pronoteLoginCookies ? pronoteLoginCookies[0].split(";")[0] : undefined
    });
  }
  else {
    res.status(404).json({
      success: false,
      message: "Method doesn't exist."
    });
  }
}
