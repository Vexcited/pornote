import type {
  NextApiRequest,
  NextApiResponse
} from "next";

import type {
  ApiInformationsResponse,
  ApiServerError
} from "types/ApiData";

import type {
  PronoteApiFonctionParametres
} from "types/PronoteApiData";

import getServerUrl from "@/apiUtils/getServerUrl";
import getPronotePage from "@/apiUtils/getPronotePage";
import checkEntAvailable from "@/apiUtils/checkEntAvailable";
import extractSession from "@/apiUtils/extractSession";
import generateOrder from "@/apiUtils/generateOrder";

import got from "got";

export default async function handler (
  req: NextApiRequest,
  res: NextApiResponse<ApiInformationsResponse | ApiServerError>
) {
  if (req.method === "POST") {
    // Dirty Pronote URL.
    const pronoteUrl: string = req.body.pronoteUrl;

    // We get URL origin and then get the DOM of account selection page.
    const pronoteServerUrl = getServerUrl(pronoteUrl);
    const [pronoteHtmlSuccess, pronoteHtmlBody] = await getPronotePage(pronoteServerUrl + "?login=true");

    // Fetch Pronote server URL without the "?login=true" part
    // to see if an ENT is available.
    const [pronoteEntSuccess, pronoteEntUrl] = await checkEntAvailable(pronoteServerUrl);

    // Checking if both functions executed successfully.
    if (!pronoteHtmlSuccess || !pronoteEntSuccess) {
      res.status(500).json({
        success: false,
        message: "Failed to execute 'getPronotePage' or 'checkEntAvailable' functions.",
        debug: {
          pronoteHtmlBody,
          pronoteEntUrl
        }
      });
    }

    // We extract session informations from the DOM.
    const session = extractSession(pronoteHtmlBody);
    const sessionId = parseInt(session.h);

    // Generate encrypted order for request.
    const orderDecrypted = 1;
    const orderEncrypted = generateOrder(orderDecrypted, {});

    // Request to Pronote server.
    // Here, is AccountID is 9 => Default for informations gathering.
    const informationsApiUrl = pronoteServerUrl + "appelfonction/9/" + session.h + "/" + orderEncrypted;
    console.log(orderEncrypted, sessionId);
    const pronoteData = await got.post(informationsApiUrl, {
      json: {
        session: sessionId,
        numeroOrdre: orderEncrypted,
        nom: "FonctionParametres",
        donneesSec: {}
      }
    }).json<PronoteApiFonctionParametres>();

    res.status(200).json({
      success: true,
      pronoteData,
      pronoteEntUrl
    });
  }
  else {
    res.status(404).json({
      success: false,
      message: "Method doesn't exist. Only POST method is available here."
    });
  }
}
