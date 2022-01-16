import type { NextApiRequest, NextApiResponse } from "next";
import type {
  InformationsResponseData,
  ApiServerError
} from "types/ApiData";

import getServerUrl from "@/apiUtils/getServerUrl";
import getPronotePage from "@/apiUtils/getPronotePage";
import extractSession from "@/apiUtils/extractSession";
import generateOrder from "@/apiUtils/generateOrder";

export default async function handler (
  req: NextApiRequest,
  res: NextApiResponse<InformationsResponseData | ApiServerError>
) {
  if (req.method === "POST") {
    // Dirty Pronote URL.
    const pronoteUrl: string = req.body.pronoteUrl;

    // We get URL origin and then get the DOM of account selection page.
    const pronoteServerUrl = getServerUrl(pronoteUrl).toLowerCase();
    const [pronoteHtmlSuccess, pronoteHtmlBody] = await getPronotePage({
      pronoteUrl: pronoteServerUrl + "?login=true",
      checkEnt: false
    });

    // Fetch Pronote server URL without the "?login=true" part
    // to see if an ENT is available.
    const [pronoteEntSuccess, pronoteEntUrl] = await getPronotePage({
      pronoteUrl: pronoteServerUrl,
      checkEnt: true
    });

    if (!pronoteHtmlSuccess || !pronoteEntSuccess) {
      res.status(500).json({
        success: false,
        message: `Failed to fetch Pronote page.\n${pronoteHtmlBody || pronoteEntUrl}`
      });
    }

    // We extract session informations from the DOM.
    const session = extractSession(pronoteHtmlBody);
    const sessionId = parseInt(session.h);

    // Generate encrypted order for request.
    const orderDecrypted = 1;
    const orderEncrypted = generateOrder(orderDecrypted);

    // Request to Pronote server.
    // Here, is AccountID is 9 => Default for informations gathering.
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

    const pronoteData = await dataResponse.json();
    const getPronoteEntUrl = new URL(pronoteEntUrl).hostname === new URL(pronoteServerUrl).hostname
      ? undefined
      : pronoteEntUrl;

    res.status(200).json({
      success: true,
      pronoteData,
      pronoteEntUrl: getPronoteEntUrl
    });
  }
  else {
    res.status(404).json({
      success: false,
      message: "Method doesn't exist. Only POST method is available here."
    });
  }
}
