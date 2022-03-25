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

  /** Account Type ID of the user to authenticate. */
  pronote_account_type_id: number;

  /** Session from Pronote HTML: `parseInt(session.h)` */
  pronote_session_id: number;

  /** **Unencrypted** order to send to Pronote. */
  pronote_session_order: number;

  /** Challenge, from `Identification`, solved. */
  pronote_auth_solved_challenge: string;

  using_ent?: boolean;
}


export default async function handler (
  req: NextApiRequest,
  res: NextApiResponse<ApiAuthenticationResponse | ApiServerError>
) {
  if (req.method === "POST") {
    /** Dirty Pronote URL. */
    const pronoteUrl: string = req.body.pronoteUrl;

    // Informations about the Pronote account path.
    const pronoteAccountId: number = req.body.pronoteAccountId;
    const pronoteSessionId: number = req.body.pronoteSessionId;

    if (!pronoteUrl || !pronoteAccountId || !pronoteSessionId) {
      return res.status(400).json({
        success: false,
        message: "Missing informations about the Pronote account path."
      });
    }

    /** Cleaned Pronote URL. */
    const pronoteServerUrl = getBasePronoteUrl(pronoteUrl);

    const pronoteOrder: number = req.body.pronoteOrder;
    if (!pronoteOrder) {
      return res.status(400).json({
        success: false,
        message: "Missing 'pronoteOrder' for 'numeroOrdre'."
      });
    }

    const pronoteSolvedChallenge: string = req.body.pronoteSolvedChallenge;
    if (!pronoteSolvedChallenge) {
      return res.status(401).json({
        success: false,
        message: "Missing 'pronoteSolvedChallenge'."
      });
    }

    const pronoteRequest = await request<PronoteApiAuthentication>({
      pronoteUrl: pronoteServerUrl,
      name: "Authentification",
      sessionId: pronoteSessionId,
      accountId: pronoteAccountId,
      order: pronoteOrder,
      body: {
        donnees: {
          connexion: 0,
          challenge: pronoteSolvedChallenge,
          espace: pronoteAccountId
        }
      },
      cookie: req.body.pronoteCookies ? (req.body.pronoteCookies as string[]).join("; ") : undefined
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
