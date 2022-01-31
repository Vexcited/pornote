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
import request from "@/apiUtils/request";

import forge from "node-forge";

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
    const pronoteAccountCookie: string | undefined = req.body.pronoteCookie;

    // We get URL origin and then get the DOM of account selection page.
    const pronoteServerUrl = getServerUrl(pronoteUrl);
    const pronoteHtmlUrl = pronoteServerUrl + pronoteAccountPath + "?login=true";
    const [pronoteHtmlSuccess, pronoteHtmlBody, pronoteHtmlCookie] = await getPronotePage(
      pronoteHtmlUrl, pronoteAccountCookie
    );

    // Fetch Pronote server URL without the "?login=true" part
    // to see if an ENT is available.
    const [pronoteEntSuccess, pronoteEntUrl] = !pronoteAccountPath
      ? await checkEntAvailable(pronoteServerUrl)
      : [true, undefined];

    // Checking if both functions executed successfully.
    if (!pronoteHtmlSuccess || !pronoteEntSuccess) {
      return res.status(500).json({
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
    const informationsApiPath = `appelfonction/${pronoteAccountId ? pronoteAccountId : "9"}/` + session.h + "/" + orderEncrypted;

    // Append POST body to request only if we
    // want to get informations for an account login.
    const informationsPostBody: { identifiantNav?: null, Uuid?: string } = {};
    let pronoteCryptoInformations: ApiInformationsResponse["pronoteCryptoInformations"] | undefined;
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

    const pronoteData = await request(pronoteServerUrl).post(informationsApiPath, {
      json: {
        session: sessionId,
        numeroOrdre: orderEncrypted,
        nom: "FonctionParametres",
        donneesSec: {
          donnees: informationsPostBody
        }
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
      pronoteHtmlCookie: pronoteHtmlCookie ? pronoteHtmlCookie[0].split(";")[0] : undefined
    });
  }
  else {
    res.status(404).json({
      success: false,
      message: "Method doesn't exist."
    });
  }
}
