import type { NextApiRequest, NextApiResponse } from "next";

import getServerUrl from "@/apiUtils/getServerUrl";
import getPronotePage from "@/apiUtils/getPronotePage";
import extractSession from "@/apiUtils/extractSession";
import generateOrder from "@/apiUtils/generateOrder";

type Data = {
    success: boolean;
    message?: string;
    sessionId?: string;
    order?: string;
}

export default async (
    req: NextApiRequest,
    res: NextApiResponse<Data>
) => {
  if (req.method === "POST") {
    const {
      pronoteUrl
    }: { 
      pronoteUrl: string;
    } = req.body;

    const pronoteServerUrl = getServerUrl(pronoteUrl);
    const pronoteHtml = await getPronotePage({
      pronoteUrl: pronoteServerUrl + "?login=true",
      onlyFetch: true
    });

    const session = extractSession(pronoteHtml);
    const order = generateOrder(1);

    res.status(200).json({
      success: true,
      sessionId: session.h,
      order
    })
  }
  else {
        res.status(404).json({
            success: false,
            message: "Method doesn't exist."
        })
    }
}
