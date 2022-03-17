import { URL } from "url";

/** Get the Pronote root path URL from any given URL. */
export default function getBasePronoteUrl (pronoteUrl: string) {
  const url = new URL(pronoteUrl);
  const raw_url = new URL(`${url.protocol}//${url.host}${url.pathname}`);

  const paths = raw_url.pathname.split("/");
  const lastPath = paths[paths.length - 1];

  if (lastPath.includes(".html")) {
    paths.pop();
  }

  raw_url.pathname = paths.join("/");

  // Return Pronote root path and remove the
  // trailing slash.
  return raw_url.href.endsWith("/") ?
    raw_url.href.slice(0, -1) :
    raw_url.href;
}