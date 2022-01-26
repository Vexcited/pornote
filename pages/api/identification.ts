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
import generateOrder from "@/apiUtils/generateOrder";

import forge from "node-forge";
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
    const pronoteAccountPath: string = req.body.pronoteAccountPath;
    const pronoteSessionId: string = req.body.pronoteSessionId;
    
    if (!pronoteUrl || !pronoteAccountId || !pronoteAccountPath || !pronoteSessionId) {
      res.status(400).json({
        success: false,
        message: "Missing informations about the Pronote account path."
      });
    }

    // 'identifiant' on 'Identification' request POST body.
    const accountIdentifier: string = req.body.identifier;    
    if (!accountIdentifier) {
      res.status(400).json({
        success: false,
        message: "Missing account identifier."
      });
    }

    /** Cleaned Pronote URL. */
    const pronoteServerUrl = getServerUrl(pronoteUrl);

    // Creathe the API endpoint using the given session ID.
    const pronoteApiUrl = `${pronoteServerUrl}appelfonction/${pronoteAccountId}/${pronoteSessionId}`;

    const pronoteOrder: number = req.body.pronoteOrder;
    const pronoteCryptoIv: string = req.body.pronoteCryptoIv;

    if (!pronoteOrder || !pronoteCryptoIv) {
      res.status(400).json({
        success: false,
        message: "Missing informations about crypto in current Pronote session."
      });
    }

    // IV that will be used for our session.
    const bufferCryptoIv = forge.util.createBuffer(pronoteCryptoIv);

    // Encrypt 'numeroOrdre' for 'Identification' request.
    const identificationOrderEncrypted = generateOrder(
      pronoteOrder, { iv: bufferCryptoIv }
    );

    const identificationApiUrl = `${pronoteApiUrl}/${identificationOrderEncrypted}`;
    const pronoteIdentificationData = await got.post(identificationApiUrl, {
      json: {
        session: pronoteSessionId,
        numeroOrdre: identificationOrderEncrypted,
        nom: "Identification",
        donneesSec: {
          donnees: {
            genreConnexion: 0,
            genreEspace: pronoteAccountId,
            identifiant: accountIdentifier,
            pourENT: false,
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
