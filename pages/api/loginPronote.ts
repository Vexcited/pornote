import type {
  NextApiRequest,
  NextApiResponse
} from "next";

import type {
  ApiLoginResponse,
  ApiServerError
} from "types/ApiData";

import type {
  PronoteApiFonctionParametres
} from "types/PronoteApiData";

import getServerUrl from "@/apiUtils/getServerUrl";
import getPronotePage from "@/apiUtils/getPronotePage";
import extractSession from "@/apiUtils/extractSession";
import generateOrder from "@/apiUtils/generateOrder";
import decryptOrder from "@/apiUtils/decryptOrder";

import forge from "node-forge";
import got from "got";

export default async function handler (
  req: NextApiRequest,
  res: NextApiResponse<ApiLoginResponse | ApiServerError>
) {
  if (req.method === "POST") {
    /** Dirty Pronote URL. */
    const pronoteUrl: string = req.body.pronoteUrl;
    // Informations about the Pronote account path.
    const pronoteAccountId: number = req.body.pronoteAccountId;
    const pronoteAccountPath: string = req.body.pronoteAccountPath;
    
    if (!pronoteUrl || !pronoteAccountId || !pronoteAccountPath) {
      res.status(400).json({
        success: false,
        message: "Missing informations about the Pronote account path."
      });
    }

    // Authentication informations (can be for ENT or Pronote).
    const accountUsername: string = req.body.username;
    const accountPassword: string = req.body.password;
    
    if (!accountUsername || !accountPassword) {
      res.status(400).json({
        success: false,
        message: "Missing authentication informations."
      });
    }

    // We get URL origin and then get the DOM of account selection page.
    const pronoteServerUrl = getServerUrl(pronoteUrl);
    const [pronoteHtmlSuccess, pronoteHtmlData] = await getPronotePage(
      pronoteServerUrl + pronoteAccountPath + "?login=true",
    );

    // Check if we can access DOM to parse data.
    if (!pronoteHtmlSuccess) {
      res.status(500).json({
        success: false,
        message: "Failed to execute 'getPronotePage' function.",
        debug: {
          pronoteHtmlData
        }
      });
    }

    // We extract session informations from the DOM.
    const session = extractSession(pronoteHtmlData);
    const sessionId = parseInt(session.h);

    // Creathe the API endpoint using our sessionId.
    const pronoteApiUrl = `${pronoteServerUrl}appelfonction/${pronoteAccountId}/${session.h}`;

    // Generate encrypted order for 'FonctionParametres' request.
    // At the first request, 'numeroOrdre' is always 1.
    const informationsOrderEncrypted = generateOrder(1, {});

    // Random IV that will be used for our session.
    const randomIv = forge.random.getBytesSync(16);
    const bufferRandomIv = forge.util.createBuffer(randomIv);

    // Create RSA using given modulos.
    const rsaKey = forge.pki.rsa.setPublicKey(
      new forge.jsbn.BigInteger(session.MR, 16),
      new forge.jsbn.BigInteger(session.ER, 16)
    );

    // Create Uuid for 'FonctionParametres'.
    const rsaUuid = forge.util.encode64(rsaKey.encrypt(randomIv), 64);

    // Request to Pronote server using account ID.
    const informationsApiUrl = `${pronoteApiUrl}/${informationsOrderEncrypted}`;
    const pronoteInformationsData = await got.post(informationsApiUrl, {
      json: {
        session: sessionId,
        numeroOrdre: informationsOrderEncrypted,
        nom: "FonctionParametres",
        donneesSec: {
          donnees: {
            Uuid: rsaUuid,
            identifiantNav: null // Will be given in the future...
          }
        }
      }
    }).json<PronoteApiFonctionParametres>();

    // Check 'numeroOrdre' from 'pronoteInformationsData'.
    // It should be equal to '2'.
    const checkInformationsOrder = decryptOrder(
      pronoteInformationsData.numeroOrdre,
      { iv: bufferRandomIv }
    );

    // Encrypt new order for 'Identification'.
    const identificationOrderEncrypted = generateOrder(
      checkInformationsOrder + 1, // This should be equal to '3'.
      { iv: bufferRandomIv }
    );

    const identificationApiUrl = `${pronoteApiUrl}/${identificationOrderEncrypted}`;
    const pronoteIdentificationData = await got.post(identificationApiUrl, {
      json: {
        session: sessionId,
        numeroOrdre: identificationOrderEncrypted,
        nom: "Identification",
        donneesSec: {
          donnees: {
            genreConnexion: 0,
            genreEspace: pronoteAccountId,
            identifiant: req.body.username,
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
    }).json();

    res.status(200).json({
      success: true,
      pronoteData: { pronoteInformationsData, pronoteIdentificationData }
    });
  }
  else {
    res.status(404).json({
      success: false,
      message: "Method doesn't exist. Only POST method is available here."
    });
  }
}
