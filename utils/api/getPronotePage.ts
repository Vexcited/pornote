import got, { HTTPError } from "got";

async function getPronotePage (pronoteUrl: string): Promise<[boolean, string]> {
  try {
    const { body } = await got.get(pronoteUrl, {
      followRedirect: false,
      headers: {
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:59.0) Gecko/20100101 Firefox/59.0"
      }
    });

    return [true, body];
  }
  catch (e) {
    const error = e as HTTPError;
    return [false, error.message];
  }
}

export default getPronotePage;