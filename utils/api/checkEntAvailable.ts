import request from "@/apiUtils/request";
import { HTTPError } from "got";

/**
 * Used in /api/informations.ts to check if an ENT is available.
 * If an ENT is available, it returns the ENT URL.
 * @param pronoteUrl - Pronote URL to check.
 * @returns
 * - `[0]: boolean`: Request succeeded or not.
 * - `[1]: string`: ENT URL if found else undefined; or error message if `[0]` is false.
 */
async function checkEntAvailable (
  pronoteUrl: string
): Promise<[boolean, string | undefined]> {
  try {
    const { url } = await request().get(pronoteUrl, {
      followRedirect: true
    });

    // Get the hostname of the Pronote URL.
    const pronoteUrlHostname = new URL(pronoteUrl).hostname;

    // Get the hostname of the redirected URL.
    const newUrlHostname = new URL(url).hostname;

    // Check if Pronote URL hostname is same as redirected URL hostname.
    // If they aren't the same, an ENT is available.
    const entAvailable = pronoteUrlHostname !== newUrlHostname;
    return [true, entAvailable ? url : undefined];
  }
  catch (e) {
    const error = e as HTTPError;
    return [false, error.message];
  }
}

export default checkEntAvailable;