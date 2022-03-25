import type {
  NextApiRequest,
  NextApiResponse
} from "next";

import type {
  ApiServerError,
  ApiGetPronoteTicketResponse
} from "types/ApiData";

import fetchEnt from "@/apiUtils/cas";

export default async function handler (
  req: NextApiRequest,
  res: NextApiResponse<ApiGetPronoteTicketResponse | ApiServerError>
) {
  if (req.method !== "POST") {
    return res.status(404).json({
      success: false,
      message: "Method doesn't exist."
    });
  }

  const entCookies: string[] = req.body.entCookies;
  const entUrl: string = req.body.entUrl;

  if (!entCookies || !entUrl) {
    return res.status(400).json({
      success: false,
      message: "'entCookies' or 'entUrl' is missing."
    });
  }

  // [boolean, string].
  // string is Pronote URL with 'identifiant=...' if boolean is true.
  // string is error message if boolean is false.
  const [fetchStatus, fetchValue] = await fetchEnt({
    url: entUrl,
    cookies: entCookies,
    onlyEntCookies: false
  });

  if (fetchStatus) {
    res.status(200).json({
      success: true,
      pronote_url: fetchValue as string
    });
  }
  else {
    res.status(400).json({
      success: false,
      message: fetchValue as string
    });
  }
}