/**
 * Take any Pronote URL and return the base URL
 * of the application. Trailing slash **is already removed**.
 */
export default function getBasePronoteUrl (pronoteUrl: string) {
  const url = new URL(pronoteUrl);
  // Clean any unwanted data from URL.
  const raw_url = new URL(`${url.protocol}//${url.host}${url.pathname}`);

  // Get the current paths.
  const paths = raw_url.pathname.split("/");
  const lastPath = paths[paths.length - 1];

  // Clear the last path if we're not in account `common` (0).
  if (lastPath.includes(".html")) {
    paths.pop();
  }

  // Reassemble the URL with cleaned paths.
  raw_url.pathname = paths.join("/");

  // Return URL without trailing slash.
  return raw_url.href.endsWith("/") ?
    raw_url.href.slice(0, -1) :
    raw_url.href;
}