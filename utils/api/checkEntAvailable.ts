import { api } from "@/apiUtils/request";
import { HTTPError } from "got";

type CheckEntAvailableSuccess = {
  success: true;
  entAvailable: boolean;
  /** URL of ENT is `entAvailable` is `true`. */
  entUrl?: string;
}

type CheckEntAvailableFail = {
  success: false;
  message: string;
  body?: any;
}

/**
 * Used in /api/informations.ts to check if an ENT is available.
 * If an ENT is available, it returns the ENT URL.
 * @param pronoteUrl - Pronote URL to check.
 */
async function checkEntAvailable (
  pronoteUrl: string
): Promise<CheckEntAvailableSuccess | CheckEntAvailableFail> {
  try {
    const { url } = await api.get(pronoteUrl, {
      followRedirect: true
    });

    // Get the hostname of the Pronote URL.
    const pronoteUrlHostname = new URL(pronoteUrl).hostname;

    // Get the hostname of the redirected URL.
    const newUrlHostname = new URL(url).hostname;

    // Check if Pronote URL hostname is same as redirected URL hostname.
    // If they aren't the same, an ENT is available.
    const entAvailable = pronoteUrlHostname !== newUrlHostname;

    return {
      success: true,
      entAvailable,
      entUrl: entAvailable ? url : undefined
    };
  }
  catch (e) {
    if (e instanceof HTTPError) {
      const body = e.response.body;

      return {
        success: false,
        message: "Erreur lors de la requête.",
        body
      };
    }

    return {
      success: false,
      message: "Erreur inconnue."
    };
  }
}

export default checkEntAvailable;