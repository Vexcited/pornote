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

  /** Account Type ID of the user to authenticate. */
  pronote_account_type_id: number;

  /** Session from Pronote HTML: `parseInt(session.h)` */
  pronote_session_id: number;

  /** **Unencrypted** order to send to Pronote. */
  pronote_session_order: number;

  /** Username of the user to authenticate. */
  pronote_username: string;

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

  const pronoteIdentificationData = await request<PronoteApiIdentification>({
    pronoteUrl: pronoteBaseUrl,
    accountId: body.pronote_account_type_id,
    sessionId: body.pronote_session_id,
    order: body.pronote_session_order,
    name: "Identification",
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
    cookie: req.body.pronoteCookies ? (req.body.pronoteCookies as string[]).join("; ") : undefined
  });

  if (!pronoteIdentificationData.success) return res.status(401).json({
    success: false,
    message: pronoteIdentificationData.message,
    debug: pronoteIdentificationData.debug
  });

  res.status(200).json({
    success: true,
    pronoteData: pronoteIdentificationData
  });
}
