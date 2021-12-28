import type { NextApiRequest, NextApiResponse } from "next";
import type { InformationsResponseData } from "types/ApiData";

import getServerUrl from "@/apiUtils/getServerUrl";
import getPronotePage from "@/apiUtils/getPronotePage";
import extractSession from "@/apiUtils/extractSession";
import generateOrder from "@/apiUtils/generateOrder";

export default async function handler (
  req: NextApiRequest,
  res: NextApiResponse<InformationsResponseData>
) {
  if (req.method === "POST") {
    // Dirty Pronote URL.
    const pronoteUrl: string = req.body.pronoteUrl;

    // We get URL origin and then get the DOM of account selection page.
    const pronoteServerUrl = getServerUrl(pronoteUrl);
    const [pronoteHtmlSuccess, pronoteHtmlData] = await getPronotePage({
      pronoteUrl: pronoteServerUrl + "?login=true",
      onlyFetch: true
    });

    if (pronoteHtmlSuccess) {
      // We extract session informations from the DOM.
      const session = extractSession(pronoteHtmlData);
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

      res.status(200).json({
        success: true,
        message: "Attached server's reponse.",
        data: await dataResponse.json()
      });
    }
    // An error occurred while fetching HTML.
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
