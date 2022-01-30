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

import getServerUrl from "@/apiUtils/getServerUrl";
import got from "got";

export default async function handler (
  req: NextApiRequest,
  res: NextApiResponse<ApiIdentificationResponse | ApiServerError>
) {
  if (req.method === "POST") {
    /** Dirty Pronote URL. */
    const pronoteUrl: string = req.body.pronoteUrl;
    // Informations about the Pronote account path.
    const pronoteAccountId: number = req.body.pronoteAccountId;
    const pronoteSessionId: number = req.body.pronoteSessionId;

    if (!pronoteUrl || !pronoteAccountId || !pronoteSessionId) {
      res.status(400).json({
        success: false,
        message: "Missing informations about the Pronote account path."
      });
    }

    // 'identifiant' on 'Identification' request POST body.
    const accountIdentifier: string = req.body.identifier;
    if (!accountIdentifier) {
      return  res.status(400).json({
        success: false,
        message: "Missing account 'identifier'."
      });
    }

    const usingEnt = req.body.usingEnt as boolean || false;

    /** Cleaned Pronote URL. */
    const pronoteServerUrl = getServerUrl(pronoteUrl);

    // Creathe the API endpoint using the given session ID.
    const pronoteApiUrl = `${pronoteServerUrl}appelfonction/${pronoteAccountId}/${pronoteSessionId}`;

    const pronoteOrder: string = req.body.pronoteOrder;
    if (!pronoteOrder) {
      return res.status(400).json({
        success: false,
        message: "Missing 'pronoteOrder' for 'numeroOrdre'."
      });
    }

    const identificationApiUrl = `${pronoteApiUrl}/${pronoteOrder}`;
    const pronoteIdentificationData = await got.post(identificationApiUrl, {
      json: {
        session: pronoteSessionId,
        numeroOrdre: pronoteOrder,
        nom: "Identification",
        donneesSec: {
          donnees: {
            genreConnexion: 0,
            genreEspace: pronoteAccountId,
            identifiant: accountIdentifier,
            pourENT: usingEnt,
            enConnexionAuto: false,
            demandeConnexionAuto: false,
            demandeConnexionAppliMobile: false,
            demandeConnexionAppliMobileJeton: false,
            uuidAppliMobile: "",
            loginTokenSAV: ""
          }
        }
      },
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.99 Safari/537.36"
      }
    }).json<PronoteApiIdentification>();

    res.status(200).json({
      success: true,
      pronoteData: pronoteIdentificationData
    });
  }
  else {
    res.status(404).json({
      success: false,
      message: "Method doesn't exist."
    });
  }
}
