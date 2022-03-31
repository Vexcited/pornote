import { connect as connectOpenEnt } from "./openent";

const ENTs = {
  "openEnt": {
    login: connectOpenEnt,
    hostnames: ["mon.lyceeconnecte.fr"]
  }
};

export type FetchEntProps = {
  /** ENT URL. */
  url: string;

  username?: string;
  password?: string;

  cookies?: string[]

  onlyEntCookies: boolean;
}

export default async function fetchEntLogin ({
  url,
  username,
  password,
  cookies,
  onlyEntCookies
}: FetchEntProps) {
  // Check if username and password for ENT is given.
  if (onlyEntCookies && (!username || !password))
    return [false, "ENT username or password not given."];

  // Check if cookies for ENT authentication is given.
  if (!onlyEntCookies && (!cookies))
    return [false, "ENT cookies aren't given."];

  // Get the login function to connect to ENT.
  const hostname = new URL(url).hostname;
  for (const [serviceName, service] of Object.entries(ENTs)) {
    const foundService = service.hostnames.find(serviceHostname => serviceHostname === hostname);

    if (foundService) {
      return await service.login({
        url,
        username,
        password,
        cookies,
        onlyEntCookies
      });
    }
  }

  return [false, "Your ENT is currently not supported."];
}