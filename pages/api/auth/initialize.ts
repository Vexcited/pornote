import type { NextApiRequest, NextApiResponse } from "next";
import fetch from "node-fetch";
import cheerio from "cheerio";

// AES Checking
import checkOrdre from "../../../utils/api/checkOrdre";

type Data = {
  success: boolean;
  message: string;
  debug?: {
    userAgent: string,
    onLoadData: string | null
  };
  session?: string;
  ordre?: any;
}

export default async (
  req: NextApiRequest,
  res: NextApiResponse<Data>
) => {
  if (req.method === "POST") {
    // Taking actual user agent. If it doesn't exist
    // take a spoofed one (Chrome, Linux x64).
    const userAgent = req.headers["user-agent"] ?? "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.81 Safari/537.36"
    const {
      pronoteBaseUrl
    }: { 
      pronoteBaseUrl: string
     } = req.body;

    if (!pronoteBaseUrl) {
      res.status(400).json({
        success: false,
        message: "Parameter 'pronoteBaseUrl' is missing."
      });
    }
    else {
        const pronoteHtmlData = await fetch(pronoteBaseUrl, {
          headers: {
            "User-Agent": userAgent
          }
        });
        const pronoteHtmlRaw = await pronoteHtmlData.text();

        // Parse HTML.
        const pronoteHtml = cheerio.load(pronoteHtmlRaw);

        // Get JSON from onLoad attribut.
        const onLoadData = pronoteHtml("body").attr("onload");
        const sessionData = onLoadData
          ?.replace("try { Start ({", "")
          .replace("}) } catch (e) { messageErreur (e) }", "");

        // Fix JSON "relaxed".
        // Extracted from https://stackoverflow.com/a/39050609.
        const sessionFixedData = sessionData
          // Replace ":" with "@colon@" if it's between double-quotes
          ?.replace(/:\s*"([^"]*)"/g, function(match, p1) {
            return ': "' + p1.replace(/:/g, '@colon@') + '"';
          })

          // Replace ":" with "@colon@" if it's between single-quotes
          .replace(/:\s*'([^']*)'/g, function(match, p1) {
            return ': "' + p1.replace(/:/g, '@colon@') + '"';
          })

          // Add double-quotes around any tokens before the remaining ":"
          .replace(/(['"])?([a-z0-9A-Z_]+)(['"])?\s*:/g, '"$2": ')

          // Turn "@colon@" back into ":"
          .replace(/@colon@/g, ":");

        // AES Check
        // The first request made to Pronote is "1",
        // and his encrypted value is always "3fa959b13967e0ef176069e01e23c8d7".
        const aesIsSame = checkOrdre("1", "3fa959b13967e0ef176069e01e23c8d7");

        res.status(200).json({
          success: true,
          message: "Session ID attached in 'session'.",
          debug: {
            userAgent,
            onLoadData: onLoadData ?? null
          },
          session: JSON.parse(`{${sessionFixedData}}`),
          ordre: {
            isSame: aesIsSame
          }
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
