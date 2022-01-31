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
import request from "@/apiUtils/request";

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
      return res.status(400).json({
        success: false,
        message: "Missing informations about the Pronote account path."
      });
    }

    // 'identifiant' on 'Identification' request POST body.
    const accountIdentifier: string = req.body.identifier;
    if (!accountIdentifier) {
      return res.status(400).json({
        success: false,
        message: "Missing account 'identifier'."
      });
    }

    const usingEnt = req.body.usingEnt as boolean || false;

    /** Cleaned Pronote URL. */
    const pronoteServerUrl = getServerUrl(pronoteUrl);

    // Create the API endpoint using the given session ID.
    const pronoteApiUrl = `${pronoteServerUrl}appelfonction/${pronoteAccountId}/${pronoteSessionId}`;

    const pronoteOrder: string = req.body.pronoteOrder;
    if (!pronoteOrder) {
      return res.status(400).json({
        success: false,
        message: "Missing 'pronoteOrder' for 'numeroOrdre'."
      });
    }

    const pronoteIdentificationData = await request(pronoteApiUrl).post(pronoteOrder, {
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
