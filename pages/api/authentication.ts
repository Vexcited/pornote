import type {
  NextApiRequest,
  NextApiResponse
} from "next";

import type {
  ApiAuthenticationResponse,
  ApiServerError
} from "types/ApiData";

import type {
  PronoteApiAuthentication
} from "types/PronoteApiData";

import getBasePronoteUrl from "@/apiUtils/getBasePronoteUrl";
import { bodyChecker } from "@/apiUtils/objectChecker";
import { request } from "@/apiUtils/request";

export type ApiAuthenticationRequestBody = {
  pronote_url: string;

  // IV for encryption.
  session_encryption_iv: string;

  /** Account Type ID of the user to authenticate. */
  pronote_account_type_id: number;

  /** Session from Pronote HTML: `parseInt(session.h)` */
  pronote_session_id: number;

  /** **Unencrypted** order to send to Pronote. */
  pronote_session_order: number;

  /** Challenge, from `Identification`, solved. */
  pronote_auth_solved_challenge: string;

  /** Cookies given when sending `/api/informations` with `pronote_setup_account_cookie`. */
  pronote_setup_account_cookie_response_cookies?: string;
}

export default async function handler (
  req: NextApiRequest,
  res: NextApiResponse<ApiAuthenticationResponse | ApiServerError>
) {
  if (req.method === "POST") {
    const bodyCheckResults = bodyChecker<ApiAuthenticationRequestBody>(req, [
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
        param: "pronote_auth_solved_challenge",
        type: "string",
        required: true
      },
      {
        param: "pronote_setup_account_cookie_response_cookies",
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

    const pronoteRequest = await request<PronoteApiAuthentication>({
      pronoteUrl: pronoteBaseUrl,
      name: "Authentification",
      sessionId: body.pronote_session_id,
      accountId: body.pronote_account_type_id,
      encryption: {
        aesIv: body.session_encryption_iv
      },
      order: body.pronote_session_order,
      body: {
        donnees: {
          connexion: 0,
          challenge: body.pronote_auth_solved_challenge,
          espace: body.pronote_account_type_id
        }
      },
      cookie: body.pronote_setup_account_cookie_response_cookies
    });

    if (!pronoteRequest.success) return res.status(401).json({
      success: false,
      message: pronoteRequest.message,
      debug: pronoteRequest.debug
    });

    res.status(200).json({
      success: true,
      request: pronoteRequest
    });
  }
  else {
    res.status(404).json({
      success: false,
      message: "Method doesn't exist."
    });
  }
}
