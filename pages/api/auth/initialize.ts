import type { NextApiRequest, NextApiResponse } from "next";
import fetch from "node-fetch";

type Data = {
  success: boolean;
  message: string;
  session?: string;
}

export default async (
  req: NextApiRequest,
  res: NextApiResponse<Data>
) => {
  if (req.method === "POST") {
    const { pronoteBaseUrl } = req.body;

    if (!pronoteBaseUrl) {
      res.status(400).json({
        success: false,
        message: "Parameter 'pronoteBaseUrl' is missing."
    }
    else {
        const rawHtmlRes = await fetch(pronoteBaseUrl);
        const rawHtml = await rawHtmlRes.text();

        res.status(200).json({
          success: true,
          message: "Session ID attached in 'session'."
          session: rawHtml // need to parse it.
        });
    }
  }
  else {
    res.status(404).json({
      success: false,
      message: "Method doesn't exist"
    });
  }
}
