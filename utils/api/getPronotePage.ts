import got, { HTTPError } from "got";

async function getPronotePage (pronoteUrl: string, cookie?: string): Promise<[boolean, string, string[]?]> {
  try {
    const { body, headers } = await got.get(pronoteUrl, {
      followRedirect: false,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.99 Safari/537.36"
        "Cookie": cookie
      }
    });

    return [true, body, headers["set-cookie"]];
  }
  catch (e) {
    const error = e as HTTPError;
    return [false, error.message];
  }
}

export default getPronotePage;
