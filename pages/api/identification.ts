import type {
  NextApiRequest,
  NextApiResponse
} from "next";

import type {
  ApiIdentificationResponse,
  ApiServerError
} from "types/ApiData";

import type {
  PronoteApiIdentification
} from "types/PronoteApiData";

import getBasePronoteUrl from "@/apiUtils/getBasePronoteUrl";
import { bodyChecker } from "@/apiUtils/objectChecker";
import { request } from "@/apiUtils/request";

export type ApiIdentificationRequestBody = {
  pronote_url: string;

  // IV for encryption.
  session_encryption_iv: string;

  /** Account Type ID of the user to authenticate. */
  pronote_account_type_id: number;

  /** Session from Pronote HTML: `parseInt(session.h)` */
  pronote_session_id: number;

  /** **Unencrypted** order to send to Pronote. */
  pronote_session_order: number;

  /** Username of the user to authenticate. */
  pronote_username: string;

  /** Cookies given when sending `/api/informations` with `pronote_setup_account_cookie`. */
  pronote_setup_account_cookie_response_cookies?: string;

  using_ent?: boolean;
}

export default async function handler (
  req: NextApiRequest,
  res: NextApiResponse<ApiIdentificationResponse | ApiServerError>
) {
  if (req.method !== "POST") return res.status(404).json({
    success: false,
    message: "Method doesn't exist."
  });

  const bodyCheckResults = bodyChecker<ApiIdentificationRequestBody>(req, [
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
      param: "pronote_username",
      type: "string",
      required: true
    },
    {
      param: "pronote_setup_account_cookie_response_cookies",
      type: "string",
      required: false
    },
    {
      param: "using_ent",
      type: "boolean",
      required: false
    }
  ]);

  if (!bodyCheckResults.success) return res.status(401).json({
    success: false,
    message: bodyCheckResults.message
  });

  const body = bodyCheckResults.body;
  const pronoteBaseUrl = getBasePronoteUrl(body.pronote_url);

  const pronoteRequest = await request<PronoteApiIdentification>({
    pronoteUrl: pronoteBaseUrl,
    accountId: body.pronote_account_type_id,
    sessionId: body.pronote_session_id,
    order: body.pronote_session_order,
    name: "Identification",
    encryption: {
      aesIv: body.session_encryption_iv
    },
    body: {
      donnees: {
        genreConnexion: 0,
        genreEspace: body.pronote_account_type_id,
        identifiant: body.pronote_username,
        pourENT: body.using_ent ?? false,
        enConnexionAuto: false,
        demandeConnexionAuto: false,
        demandeConnexionAppliMobile: false,
        demandeConnexionAppliMobileJeton: false,
        uuidAppliMobile: "",
        loginTokenSAV: ""
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
