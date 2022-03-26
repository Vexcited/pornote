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

import { bodyChecker } from "@/apiUtils/objectChecker";
import { request } from "@/apiUtils/request";

import getBasePronoteUrl from "@/apiUtils/getBasePronoteUrl";
import extractSession from "@/apiUtils/extractSession";
import { getAccountTypeById } from "@/apiUtils/accountTypes";

import forge from "node-forge";

export type ApiInformationsRequestBody = {
  pronote_url: string;

  /** Account Type ID to use. */
  pronote_account_type_id: number;

  /** Whether to parse (`getBasePronoteUrl`) Pronote URL or not. */
  use_raw_pronote_url: boolean;

  /**
   * Cookie used when getting Pronote HTML page.
   * Needed when creating a new session from ENT or an already set-up session.
   *
   * This will append `e` and `f` in to the HTML session object.
   */
  pronote_setup_account_cookie?: string;
}

export default async function handler (
  req: NextApiRequest,
  res: NextApiResponse<ApiInformationsResponse | ApiServerError>
) {
  if (req.method === "POST") {
    const bodyCheckResults = bodyChecker<ApiInformationsRequestBody>(req, [
      {
        param: "pronote_url",
        type: "string",
        required: true
      },
      {
        param: "pronote_account_type_id",
        type: "number",
        required: true
      },
      {
        param: "use_raw_pronote_url",
        type: "boolean",
        required: true
      },
      {
        param: "pronote_setup_account_cookie",
        type: "string",
        required: false
      }
    ]);

    if (!bodyCheckResults.success) return res.status(401).json({
      success: false,
      message: bodyCheckResults.message
    });

    const body = bodyCheckResults.body;

    // Getting the account type ID
    const accountType = getAccountTypeById(body.pronote_account_type_id);
    if (!accountType) return res.status(401).json({
      success: false,
      message: "La valeur de la clé `pronote_account_type_id` est incorrecte."
    });

    // Get a clean Pronote URL without the ENT bypass.
    const pronoteUrl = getBasePronoteUrl(body.pronote_url);

    // Get the URL of the Pronote page to fetch.
    // When we use raw URL, it's often for ENT or restore session purposes.
    const pronoteHtmlUrl = body.use_raw_pronote_url
      ? body.pronote_url
      : pronoteUrl + `/${accountType.path}?login=true`;

    // Get the Pronote HTML page to parse session data.
    const pronotePageData = await getPronotePage(
      pronoteHtmlUrl, body.pronote_setup_account_cookie
    );

    // Check if the request was successful.
    if (!pronotePageData.success) return res.status(500).json({
      success: false,
      message: pronotePageData.message,
      debug: {
        pronoteHtmlUrl,
        pronoteSetupAccountCookie: body.pronote_setup_account_cookie,
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

    const pronoteCryptoInformations = {
      iv: randomIv,
      session
    };

    let cookie: string | undefined = undefined;
    if (pronotePageData.loginCookie) {
      if (body.pronote_setup_account_cookie)
        cookie = body.pronote_setup_account_cookie + "; ";
      else
        cookie = "";

      cookie += pronotePageData.loginCookie.split(";")[0];
    }

    const request_body = {
      donnees: {
        identifiantNav: null,
        Uuid: rsaUuid
      }
    };

    const pronoteRequest = await request<PronoteApiFonctionParametresStudent>({
      name: "FonctionParametres",
      body: request_body,
      pronoteUrl,
      order: 1,
      sessionId: parseInt(session.h),
      accountId: accountType.id,
      encryption: {
        only_use_iv_to_decrypt_returned_order: true,
        aesIv: pronoteCryptoInformations.iv,
      },
      cookie,
      isCompressed: !session.sCoA,
      isEncrypted: !session.sCrA
    });

    if (!pronoteRequest.success) return res.status(500).json({
      success: false,
      message: pronoteRequest.message,
      debug: {
        pronoteUrl,
        request: pronoteRequest
      }
    });

    res.status(200).json({
      success: true,
      request: pronoteRequest,
      pronoteCryptoInformations,
      pronote_setup_account_cookie_response_cookies: pronotePageData.loginCookie ? pronotePageData.loginCookie.split(";")[0] : undefined
    });
  }
  else {
    res.status(404).json({
      success: false,
      message: "Method doesn't exist."
    });
  }
}
