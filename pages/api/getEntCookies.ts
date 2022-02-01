import type {
  NextApiRequest,
  NextApiResponse
} from "next";

import type {
  ApiGetEntCookiesResponse,
  ApiServerError
} from "types/ApiData";

import fetchEnt from "@/apiUtils/cas";

export default async function handler (
  req: NextApiRequest,
  res: NextApiResponse<ApiGetEntCookiesResponse | ApiServerError>
) {
  if (req.method !== "POST") {
    return res.status(404).json({
      success: false,
      message: "Method doesn't exist."
    });
  }

  const entUrl: string = req.body.entUrl;
  const entUsername: string = req.body.entUsername;
  const entPassword: string = req.body.entPassword;

  if (!entUrl || !entUsername || !entPassword) {
    return res.status(400).json({
      success: false,
      message: "'entUrl', 'entUsername' or 'entPassword' is missing."
    });
  }

  // [boolean, string].
  // string is Pronote HTML cookie if boolean is true.
  // string is error message if boolean is false.
  const [fetchStatus, fetchValue] = await fetchEnt({
    url: entUrl,
    username: entUsername,
    password: entPassword,
    onlyEntCookies: true
  });

  if (fetchStatus) {
    res.status(200).json({
      success: true,
      entCookies: fetchValue as string[]
    });
  }
  else {
    res.status(400).json({
      success: false,
      message: fetchValue as string
    });
  }
}