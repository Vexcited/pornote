import type { NextApiRequest, NextApiResponse } from "next";
import type { PronoteSession } from "types/PronoteSession";

import getServerUrl from "@/apiUtils/getServerUrl";
import getPronotePage from "@/apiUtils/getPronotePage";
import extractSession from "@/apiUtils/extractSession";
import generateOrder from "@/apiUtils/generateOrder";

type ResponseData = {
    success: boolean;
    message: string;

    // Informations that can help debug.
    debug?: {
      session: PronoteSession;
      order: {
        decrypted: number;
        encrypted: string;
      }
    };

    data?: any;
}

export default async (
    req: NextApiRequest,
    res: NextApiResponse<ResponseData>
) => {
  if (req.method === "POST") {
    // Dirty Pronote URL.
    const pronoteUrl: string = req.body.pronoteUrl;

    // We get URL origin and then get the DOM of account selection page.
    const pronoteServerUrl = getServerUrl(pronoteUrl);
    const pronoteHtml = await getPronotePage({
      pronoteUrl: pronoteServerUrl + "?login=true",
      onlyFetch: true
    });

    // We extract session informations from the DOM.
    const session = extractSession(pronoteHtml);
    const sessionId = parseInt(session.h);

    // Generate encrypted order for request.
    const orderDecrypted = 1;
    const orderEncrypted = generateOrder(orderDecrypted);

    // Request to Pronote server.
    const informationsApiUrl = pronoteServerUrl + "appelfonction/9/" + session.h + "/" + orderEncrypted;
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
          donneesSec: {}
        })
      }
    );

    // Parse server response.
    const data = await dataResponse.json();

    res.status(200).json({
      success: true,
      message: "Grabbed SessionId and informations.",
      debug: {
        order: {
          decrypted: orderDecrypted,
          encrypted: orderEncrypted
        },
        session
      },
      data
    })
  }
  else {
        res.status(404).json({
            success: false,
            message: "Method doesn't exist."
        })
    }
}
