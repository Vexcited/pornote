import { URL } from "url";

/** Get the Pronote root path URL from any given URL. */
export default function getServerUrl (pronoteUrl: string) {
  const parsed = new URL(pronoteUrl);
  const pronote_path = parsed.origin + parsed.pathname;

  // Return Pronote root path and remove the
  // trailing slash.
  return pronote_path.endsWith("/") ?
    pronote_path.slice(0, -1) :
    pronote_path;
}