import type {
  NextApiRequest,
  NextApiResponse
} from "next";

import type {
  ApiInformationsResponse,
  ApiServerError
} from "types/ApiData";

import type {
  PronoteApiFonctionParametresCommon,
  PronoteApiFonctionParametresStudent
} from "types/PronoteApiData";

import getServerUrl from "@/apiUtils/getServerUrl";
import getPronotePage from "@/apiUtils/getPronotePage";
import checkEntAvailable from "@/apiUtils/checkEntAvailable";
import extractSession from "@/apiUtils/extractSession";
import encryptAes from "@/apiUtils/encryptAes";

import forge from "node-forge";
import got from "got";

export default async function handler (
  req: NextApiRequest,
  res: NextApiResponse<ApiInformationsResponse | ApiServerError>
) {
  if (req.method === "POST") {
    // Dirty Pronote URL.
    const pronoteUrl: string = req.body.pronoteUrl;

    // Given when authenticating with Pronote.
    const pronoteAccountPath: string | undefined = req.body.pronoteAccountPath ?? "";
    const pronoteAccountId: number | undefined = req.body.pronoteAccountId;

    // We get URL origin and then get the DOM of account selection page.
    const pronoteServerUrl = getServerUrl(pronoteUrl);
    const pronoteHtmlUrl = pronoteServerUrl + pronoteAccountPath + "?login=true";
    const [pronoteHtmlSuccess, pronoteHtmlBody, pronoteHtmlCookies] = await getPronotePage(
      pronoteHtmlUrl,
      req.body.pronoteCookie as string
    );

    // Fetch Pronote server URL without the "?login=true" part
    // to see if an ENT is available.
    const [pronoteEntSuccess, pronoteEntUrl] = !pronoteAccountPath
      ? await checkEntAvailable(pronoteServerUrl)
      : [true, undefined];

    // Checking if both functions executed successfully.
    if (!pronoteHtmlSuccess || !pronoteEntSuccess) {
      res.status(500).json({
        success: false,
        message: `Failed to execute 'getPronotePage'${!pronoteAccountPath && " or 'checkEntAvailable'"}.`,
        debug: {
          pronoteHtmlUrl,
          pronoteHtmlBody,
          pronoteEntUrl
        }
      });
    }

    // We extract session informations from the DOM.
    const session = extractSession(pronoteHtmlBody);
    const sessionId = parseInt(session.h);

    // Generate encrypted order for request.
    const orderEncrypted = encryptAes("1", {});

    // Request to Pronote server.
    // AccountID: 9 => Default for informations gathering (no account type).
    const informationsApiUrl = pronoteServerUrl + `appelfonction/${pronoteAccountId ? pronoteAccountId : "9"}/` + session.h + "/" + orderEncrypted;

    // Append POST body to request only if we
    // want to get informations for an account login.
    const informationsPostBody: { identifiantNav?: null, Uuid?: string } = {};
    let pronoteCryptoInformations: ApiInformationsResponse["pronoteCryptoInformations"] | undefined = undefined;
    if (pronoteAccountId && pronoteAccountPath) {
      // Random IV that will be used for our session.
      const randomIv = forge.random.getBytesSync(16);

      // Create RSA using given modulos.
      const rsaKey = forge.pki.rsa.setPublicKey(
        new forge.jsbn.BigInteger(session.MR, 16),
        new forge.jsbn.BigInteger(session.ER, 16)
      );

      // Create Uuid for 'FonctionParametres'.
      const rsaUuid = forge.util.encode64(rsaKey.encrypt(randomIv), 64);

      informationsPostBody.identifiantNav = null;
      informationsPostBody.Uuid = rsaUuid;

      // Append crypto informations we used to response.
      pronoteCryptoInformations = {
        iv: randomIv,
        session
      };
    }

    const pronoteData = await got.post(informationsApiUrl, {
      json: {
        session: sessionId,
        numeroOrdre: orderEncrypted,
        nom: "FonctionParametres",
        donneesSec: {
          donnees: informationsPostBody
        }
      },
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.99 Safari/537.36"
      }
    }).json<
      | PronoteApiFonctionParametresCommon
      | PronoteApiFonctionParametresStudent
    >();

    res.status(200).json({
      success: true,
      pronoteData,
      pronoteEntUrl,
      pronoteCryptoInformations,
      pronoteHtmlCookie: pronoteHtmlCookies ? pronoteHtmlCookies[0].split(";")[0] : undefined
    });
  }
  else {
    res.status(404).json({
      success: false,
      message: "Method doesn't exist."
    });
  }
}
