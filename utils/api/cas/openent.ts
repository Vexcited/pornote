import got from "got";

type Parameters = {
  url: string;
  username: string;
  password: string;
}

/**
 * Connection for OpenENT.
 */
export async function connect ({ url, username, password }: Parameters) {
  const location = new URL(url);
  const searchParams = location.searchParams;

  const service = searchParams.get("service");
  const target = location.hostname;

  const response = await got.post(`https://${target}/auth/login`, {
    json: {
      email: username,
      password,
      callback: `/cas/login?service=${service}`
    }
  });

  return response;
}