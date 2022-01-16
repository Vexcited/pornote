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
    // Dirty Pronote URL.
    const pronoteUrl: string = req.body.pronoteUrl;
    const pronoteAccountId: number = req.body.pronoteAccountId;
    const pronoteAccountPath: string = req.body.pronoteAccountPath;

    // We get URL origin and then get the DOM of account selection page.
    const pronoteServerUrl = getServerUrl(pronoteUrl);
    const [pronoteHtmlSuccess, pronoteHtmlData] = await getPronotePage(
      pronoteServerUrl + pronoteAccountPath + "?login=true",
    );

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

    // Generate encrypted order for request.
    const orderDecrypted = 1;
    const orderEncrypted = generateOrder(orderDecrypted);

    const randomTempIv = forge.util.createBuffer().fillWithByte(0, 16);

    const lRSA = forge.pki.rsa.setPublicKey(
      new forge.jsbn.BigInteger(session.MR, 16),
      new forge.jsbn.BigInteger(session.ER, 16)
    );

    const lResult = forge.util.encode64(lRSA.encrypt(randomTempIv.bytes()), 64);

    // Request to Pronote server using account ID.
    const informationsApiUrl = `${pronoteServerUrl}appelfonction/${pronoteAccountId}/${session.h}/${orderEncrypted}`;
    const pronoteData = await got.post(informationsApiUrl, {
      json: {
        session: sessionId,
        numeroOrdre: orderEncrypted,
        nom: "FonctionParametres",
        donneesSec: {
          donnees: {
            Uuid: lResult,
            identifiantNav: null
          }
        }
      }
    }).json<PronoteApiFonctionParametres>();

    res.status(200).json({
      success: true,
      pronoteData: {
        decrypted: decryptOrder(pronoteData.numeroOrdre),
        pronoteData
      }
    });
  }
  else {
    res.status(404).json({
      success: false,
      message: "Method doesn't exist. Only POST method is available here."
    });
  }
}