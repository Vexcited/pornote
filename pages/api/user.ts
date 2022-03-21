import type {
  NextApiRequest,
  NextApiResponse
} from "next";

import type {
  ApiUserResponse,
  ApiServerError
} from "types/ApiData";

import type {
  PronoteApiUserDataStudent
} from "types/PronoteApiData";

import getBasePronoteUrl from "@/apiUtils/getBasePronoteUrl";
import { request } from "@/apiUtils/request";

export default async function handler (
  req: NextApiRequest,
  res: NextApiResponse<ApiUserResponse | ApiServerError>
) {
  if (req.method === "POST") {
    /** Dirty Pronote URL. */
    const pronoteUrl: string = req.body.pronoteUrl;

    // Informations about the Pronote account path.
    const pronoteAccountId: number = req.body.pronoteAccountId;
    const pronoteSessionId: number = req.body.pronoteSessionId;

    if (!pronoteUrl || !pronoteAccountId || !pronoteSessionId) {
      return res.status(400).json({
        success: false,
        message: "Missing informations about the Pronote account path."
      });
    }

    /** Cleaned Pronote URL. */
    const pronoteServerUrl = getBasePronoteUrl(pronoteUrl);


    const pronoteOrder: number = req.body.pronoteOrder;
    if (!pronoteOrder) {
      return res.status(400).json({
        success: false,
        message: "Missing 'pronoteOrder' for 'numeroOrdre'."
      });
    }

    const pronoteUserDataResponse = await request<
      | PronoteApiUserDataStudent
    >({
      pronoteUrl: pronoteServerUrl,
      sessionId: pronoteSessionId,
      accountId: pronoteAccountId,
      order: pronoteOrder,
      name: "ParametresUtilisateur",
      body: {},
      cookie: req.body.pronoteCookie ? req.body.pronoteCookie : undefined
    });

    if (!pronoteUserDataResponse.success) return res.status(401).json({
      success: false,
      message: pronoteUserDataResponse.message,
      debug: pronoteUserDataResponse.debug
    });


    const pronoteLoginCookies = pronoteUserDataResponse.headers["set-cookie"];

    res.status(200).json({
      success: true,
      pronoteData: pronoteUserDataResponse,
      pronoteLoginCookie: pronoteLoginCookies ? pronoteLoginCookies[0].split(";")[0] : undefined
    });
  }
  else {
    res.status(404).json({
      success: false,
      message: "Method doesn't exist."
    });
  }
}
