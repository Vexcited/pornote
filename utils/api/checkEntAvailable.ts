import got, { HTTPError } from "got";

/**
 * Used in /api/informations.ts to check if an ENT is available.
 * If an ENT is available, it returns the ENT URL.
 */
async function checkEntAvailable (pronoteUrl: string): Promise<[boolean, string | undefined]> {
  try {
    const { url } = await got.get(pronoteUrl, {
      followRedirect: true,
      headers: {
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:59.0) Gecko/20100101 Firefox/59.0"
      }
    });

    const pronoteUrlHostname = new URL(pronoteUrl).hostname;
    const newUrlHostname = new URL(url).hostname;
    const entAvailable = pronoteUrlHostname !== newUrlHostname;

    return [true, entAvailable ? url : undefined];
  }
  catch (e) {
    const error = e as HTTPError;
    return [false, error.message];
  }
}

export default checkEntAvailable;