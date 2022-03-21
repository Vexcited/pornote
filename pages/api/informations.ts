import type {
  NextApiRequest,
  NextApiResponse
} from "next";

import type {
  ApiInformationsResponse,
  ApiServerError
} from "types/ApiData";

import type {
  PronoteApiFonctionParametresStudent
} from "types/PronoteApiData";

import getPronotePage from "@/apiUtils/getPronotePage";

import objectChecker from "@/apiUtils/objectChecker";
import { request } from "@/apiUtils/request";

import getBasePronoteUrl from "@/apiUtils/getBasePronoteUrl";
import extractSession from "@/apiUtils/extractSession";
import accountTypes from "@/apiUtils/accountTypes";

import forge from "node-forge";

export type ApiInformationsRequestBody = {
  pronoteUrl: string;
  /**
   * Account ID of the type of user to use.
   * Defaults to `0` (common).
   */
  pronoteAccountId: number;

  useRawUrl: boolean;

  /**
   * Cookie used when getting Pronote HTML page.
   * Needed when creating a new session from ENT or an already set-up session.
   */
  pronoteAccountCookie?: string;
}

type BodyCheckerSuccess = {
  success: true;
  body: ApiInformationsRequestBody;
}

type BodyCheckerFail = {
  success: false;
  message: string;
}

const bodyChecker = (req: NextApiRequest): BodyCheckerSuccess | BodyCheckerFail => {
  const body = objectChecker<ApiInformationsRequestBody>(req.body);

  try {
    const pronoteUrl = body.get("pronoteUrl", "string", { required: true });

    const pronoteAccountId = body.get("pronoteAccountId", "number") ?? 0;
    const pronoteAccountCookie = body.get("pronoteAccountCookie", "string");

    const useRawUrl = body.get("useRawUrl", "boolean") ?? false;

    return {
      success: true,
      body: {
        useRawUrl,
        pronoteUrl,
        pronoteAccountId,
        pronoteAccountCookie
      }
    };
  }
  catch (e) {
    const error = e as Error;

    return {
      success: false,
      message: error.message
    };
  }
};

export default async function handler (
  req: NextApiRequest,
  res: NextApiResponse<ApiInformationsResponse | ApiServerError>
) {
  if (req.method === "POST") {
    const bodyCheckResults = bodyChecker(req);
    if (!bodyCheckResults.success) return res.status(401).json({
      success: false,
      message: bodyCheckResults.message
    });

    const body = bodyCheckResults.body;

    const accountType = accountTypes.find(type => type.id === body.pronoteAccountId!);
    if (!accountType) return res.status(401).json({
      success: false,
      message: "La valeur de la clé `pronoteAccountId` est incorrecte."
    });

    // Get a clean Pronote URL without the ENT bypass.
    const pronoteUrl = getBasePronoteUrl(body.pronoteUrl);

    // Get the URL of the Pronote page to fetch.
    // When we use raw URL, it's often for ENT or restore session purposes.
    const pronoteHtmlUrl = body.useRawUrl
      ? body.pronoteUrl
      : pronoteUrl + `/${accountType.path}?login=true`;

    // Get the Pronote HTML page to parse session data.
    const pronotePageData = await getPronotePage(
      pronoteHtmlUrl, body.pronoteAccountCookie
    );

    // Check if the request was successful.
    if (!pronotePageData.success) return res.status(500).json({
      success: false,
      message: pronotePageData.message,
      debug: {
        pronoteHtmlUrl,
        pronoteAccountCookie: body.pronoteAccountCookie,
        pronotePageBody: pronotePageData.body
      }
    });

    // We extract session informations from the DOM.
    const sessionResults = extractSession(pronotePageData.body);
    if (!sessionResults.success) {
      return res.status(500).json({
        success: false,
        message: "Failed to extract session informations from the DOM.",
        debug: {
          pronotePageBody: pronotePageData.body,
          pronoteHtmlUrl,
          pronoteUrl
        }
      });
    }

    const { session } = sessionResults;

    // Random IV that will be used for our session.
    const randomIv = forge.random.getBytesSync(16);

    // Create RSA using given modulos.
    const rsaKey = forge.pki.rsa.setPublicKey(
      new forge.jsbn.BigInteger(session.MR, 16),
      new forge.jsbn.BigInteger(session.ER, 16)
    );

    // Create Uuid for 'FonctionParametres'.
    const rsaUuid = forge.util.encode64(rsaKey.encrypt(randomIv), 64);

    const informationsPostBody = {
      identifiantNav: null,
      Uuid: rsaUuid
    };

    const pronoteCryptoInformations = {
      iv: randomIv,
      session
    };

    const pronoteData = await request<
        | PronoteApiFonctionParametresStudent
      >({
        name: "FonctionParametres",
        body: informationsPostBody,
        pronoteUrl,
        order: 1,
        sessionId: parseInt(session.h),
        accountId: accountType.id,
        cookie: pronotePageData.loginCookie ? `${body.pronoteAccountCookie ? body.pronoteAccountCookie + "; " : ""}${pronotePageData.loginCookie.split(";")[0]}` : undefined,
        isCompressed: !session.sCoA,
        isEncrypted: !session.sCrA
      });

    if (!pronoteData.success) return res.status(500).json({
      success: false,
      message: pronoteData.message,
      debug: {
        pronoteUrl,
        request: pronoteData
      }
    });

    res.status(200).json({
      success: true,
      pronoteData,
      pronoteCryptoInformations,
      pronoteHtmlCookie: pronotePageData.loginCookie ? pronotePageData.loginCookie.split(";")[0] : undefined
    });
  }
  else {
    res.status(404).json({
      success: false,
      message: "Method doesn't exist."
    });
  }
}
