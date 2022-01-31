import got from "got";

/**
 * Extend got object so we don't have to rewrite
 * the whole User-Agent header every time.
 */
export default function request (prefixUrl: string = "") {
  return got.extend({
    prefixUrl,
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.99 Safari/537.36"
    }
  });
}