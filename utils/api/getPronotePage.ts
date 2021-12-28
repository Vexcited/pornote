import got from "got";

type Parameters = {
  onlyFetch: boolean;
  pronoteUrl: string;
  method?: "GET" | "POST";
  followRedirect?: boolean;
}

export default async function getPronotePage ({
  onlyFetch, // If true, return the DOM as is.
  pronoteUrl, // URL that we'll get.
  method = "GET",
  followRedirect = true
}: Parameters): Promise<[boolean, string]> {
  try {
    const html = await got(pronoteUrl, {
      method,
      followRedirect,
      headers: {
        // Give a fake User-Agent to make it real.
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:59.0) Gecko/20100101 Firefox/59.0"
      }
    }).text();

    // If we're only fetching, return the HTML.
    if (onlyFetch) {
      return [true, html]
    }

    // TODO: (Check ENT) ~
    else {
      return [true, html];
    }
  }
  catch (e) {
    const error = e as Error;
    return [false, error.message];
  }
}
