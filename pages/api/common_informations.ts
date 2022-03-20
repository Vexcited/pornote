import type {
  NextApiRequest,
  NextApiResponse
} from "next";

import type {
  ApiCommonInformationsResponse,
  ApiServerError
} from "types/ApiData";

import type {
  PronoteApiFonctionParametresCommon
} from "types/PronoteApiData";

import getPronotePage from "@/apiUtils/getPronotePage";
import checkEntAvailable from "@/apiUtils/checkEntAvailable";

import objectChecker from "@/apiUtils/objectChecker";
import { request } from "@/apiUtils/request";

import getBasePronoteUrl from "@/apiUtils/getBasePronoteUrl";
import extractSession from "@/apiUtils/extractSession";

export type ApiCommonInformationsRequestBody = {
  pronoteUrl: string;
}

type BodyCheckerSuccess = {
  success: true;
  body: ApiCommonInformationsRequestBody;
}

type BodyCheckerFail = {
  success: false;
  message: string;
}

const bodyChecker = (req: NextApiRequest): BodyCheckerSuccess | BodyCheckerFail => {
  const body = objectChecker<ApiCommonInformationsRequestBody>(req.body);

  try {
    const pronoteUrl = body.get("pronoteUrl", "string", { required: true });

    return {
      success: true,
      body: {
        pronoteUrl
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
  res: NextApiResponse<ApiCommonInformationsResponse | ApiServerError>
) {
  if (req.method === "POST") {
    const bodyCheckResults = bodyChecker(req);
    if (!bodyCheckResults.success) return res.status(401).json({
      success: false,
      message: bodyCheckResults.message
    });

    const body = bodyCheckResults.body;
    const pronoteUrl = getBasePronoteUrl(body.pronoteUrl);

    // Get the Pronote HTML page to parse session data.
    // We add `?login=true` at the end to bypass ENT.
    const pronotePageData = await getPronotePage(pronoteUrl + "/?login=true");

    // Check if the HTML page has been correctly fetched.
    if (!pronotePageData.success) return res.status(500).json({
      success: false,
      message: pronotePageData.message,
      debug: {
        pronoteUrl,
        pronotePageBody: pronotePageData.body
      }
    });

    // We don't add `?login=true` at the end this time to be
    // redirected to the ENT page if it's available.
    const entCheckData = await checkEntAvailable(pronoteUrl);

    // Check if the request for ENT check has been successful.
    if (!entCheckData.success) {
      return res.status(500).json({
        success: false,
        message: entCheckData.message,
        debug: {
          pronoteUrl,
          entCheckBody: entCheckData.body
        }
      });
    }

    // We extract session informations from the DOM of the Pronote page.
    const sessionData = extractSession(pronotePageData.body);
    if (!sessionData.success) {
      return res.status(500).json({
        success: false,
        message: sessionData.message,
        debug: {
          pronotePageBody: pronotePageData.body,
          sessionDebug: sessionData.debug,
          pronoteUrl
        }
      });
    }

    const pronoteRequest = await request<PronoteApiFonctionParametresCommon>({
      order: 1,
      pronoteUrl,
      name: "FonctionParametres",
      body: {},
      sessionId: parseInt(sessionData.session.h),
      accountId: 0, // Common: `0`.
      isCompressed: !sessionData.session.sCoA,
      isEncrypted: !sessionData.session.sCrA
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
      pronoteEntUrl: entCheckData.entAvailable ? entCheckData.entUrl : undefined
    });
  }
  else {
    res.status(404).json({
      success: false,
      message: "Method doesn't exist."
    });
  }
}
