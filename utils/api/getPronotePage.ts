import got, { HTTPError } from "got";

type Parameters = {
  /** Follow redirections to ENT. */
  checkEnt: boolean;

  /** URL to fetch. */
  pronoteUrl: string;
}

export default async function getPronotePage (
  { checkEnt, pronoteUrl }: Parameters
): Promise<[boolean, string]> {
  try {
    const { body, url } = await got.get(pronoteUrl, {
      followRedirect: checkEnt,
      headers: {
        // Give a fake User-Agent to make it real.
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:59.0) Gecko/20100101 Firefox/59.0"
      }
    });

    // Pronote: return body.
    // ENT: return URL.
    return [true, checkEnt ? url.toLowerCase() : body];
  }
  catch (e) {
    const error = e as HTTPError;
    return [false, error.message];
  }
}
