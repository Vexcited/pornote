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

import getServerUrl from "@/apiUtils/getServerUrl";
import request from "@/apiUtils/request";

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
    const pronoteServerUrl = getServerUrl(pronoteUrl);

    // Create API endpoint using the given session ID.
    const pronoteApiUrl = `${pronoteServerUrl}/appelfonction/${pronoteAccountId}/${pronoteSessionId}`;

    const pronoteOrder: string = req.body.pronoteOrder;
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

    const pronoteAuthenticationData = await request(pronoteApiUrl).post(pronoteOrder, {
      headers: {
        "Cookie": req.body.pronoteCookies ? (req.body.pronoteCookies as string[]).join("; ") : undefined
      },
      json: {
        session: pronoteSessionId,
        numeroOrdre: pronoteOrder,
        nom: "Authentification",
        donneesSec: {
          donnees: {
            connexion: 0,
            challenge: pronoteSolvedChallenge,
            espace: pronoteAccountId
          }
        }
      }
    }).json<PronoteApiAuthentication>();

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
