import fetch from "node-fetch";

type Parameters = {
  onlyFetch: boolean;
  pronoteUrl: string;
  method?: "GET" | "POST";
  followRedirects?: boolean;
}

export default async function getPronotePage ({
  onlyFetch, // If true, return the DOM as is.
  pronoteUrl, // URL that we'll get.
  method = "GET",
  followRedirects = true
}): Promise<string> {
  const htmlResponse = await fetch(
    pronoteUrl,
    {
      method,
      redirect: followRedirects ? "follow" : "manual",
      headers: {
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:59.0) Gecko/20100101 Firefox/59.0"
      }
    }
  );

  const html = await htmlResponse.text();

  if (onlyFetch) {
    return html; 
  }
}
