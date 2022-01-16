import type { NextApiRequest, NextApiResponse } from "next";
import type { PronoteFonctionParametres } from "types/PronoteData";

import getServerUrl from "@/apiUtils/getServerUrl";
import getPronotePage from "@/apiUtils/getPronotePage";
import extractSession from "@/apiUtils/extractSession";
import generateOrder from "@/apiUtils/generateOrder";

import decryptOrder from "@/apiUtils/decryptOrder";

import forge from "node-forge";

export default async function handler (
  req: NextApiRequest,
  res: NextApiResponse<{
        success: boolean;
        message: string;
        debug?: any;
        data?: PronoteFonctionParametres;
    }>
) {
  /**
     * POST /api/login
     */
  if (req.method === "POST") {
    // Dirty Pronote URL.
    const pronoteUrl: string = req.body.pronoteUrl;
    const pronoteAccountId: number = req.body.pronoteAccountId;
    const pronoteAccountPath: string = req.body.pronoteAccountPath;

    // We get URL origin and then get the DOM of account selection page.
    const pronoteServerUrl = getServerUrl(pronoteUrl);
    const [pronoteHtmlSuccess, pronoteHtmlData] = await getPronotePage({
      pronoteUrl: pronoteServerUrl + pronoteAccountPath + "?login=true",
      checkEnt: false
    });

    if (pronoteHtmlSuccess) {
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

      // Request to Pronote server.
      // Here, is AccountID is 9 => Default for informations gathering.
      const informationsApiUrl = `${pronoteServerUrl}appelfonction/${pronoteAccountId}/${session.h}/${orderEncrypted}`;
      const dataResponse = await fetch (
        informationsApiUrl,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            session: sessionId,
            numeroOrdre: orderEncrypted,
            nom: "FonctionParametres",
            donneesSec: {
              donnees: {
                Uuid: lResult,
                identifiantNav: null
              }
            }
          })
        }
      );

      const data = await dataResponse.json() as PronoteFonctionParametres;
      res.status(200).json({
        success: true,
        message: "TODO",
        data,
        debug: {
          decrypted: decryptOrder(data.numeroOrdre)
        }
      });
    }
    else {
      res.status(500).json({
        success: false,
        message: `Failed to fetch Pronote page.\n${pronoteHtmlData}`
      });
    }
  }
  else {
    res.status(404).json({
      success: false,
      message: "Method doesn't exist. Only POST method is available here."
    });
  }
}