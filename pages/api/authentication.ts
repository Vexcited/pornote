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
import { request } from "@/apiUtils/request";

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

    const pronoteAuthenticationData = await request<PronoteApiAuthentication>({
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

    if (!pronoteAuthenticationData.success) return res.status(401).json({
      success: false,
      message: pronoteAuthenticationData.message,
      debug: pronoteAuthenticationData.debug
    });

    res.status(200).json({
      success: true,
      pronoteData: pronoteAuthenticationData
    });
  }
  else {
    res.status(404).json({
      success: false,
      message: "Method doesn't exist."
    });
  }
}
