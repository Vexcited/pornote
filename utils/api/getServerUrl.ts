import { URL } from "url";

/**
 * Get the `/pronote/` URL from any given URL.
 */
export default function getServerUrl (
  pronoteUrl: string
): string {
  const parsed = new URL(pronoteUrl);

  return parsed.origin + "/pronote/";
}