import type { PronoteSession } from "types/PronoteApiData";

type ExtractSessionFail = {
  success: false;
  message: string;

  /**
   * Content of the `sessionData` variable
   * to debug more easily.
   */
  debug?: string;
}

type ExtractSessionSuccess = {
  success: true;
  session: PronoteSession;
}

export default function extractSession (
  pronoteHtml: string
): ExtractSessionSuccess | ExtractSessionFail {
  /** Temporary banned IP address error. */
  if (pronoteHtml.includes("Votre adresse IP est provisoirement suspendue")) {
    return {
      success: false,
      message: "Votre adresse IP est provisoirement suspendue."
    };
  }

  /** Pronote has been closed. */
  if (pronoteHtml.includes("Le site n'est pas disponible")) {
    return {
      success: false,
      message: "Le site n'est pas disponible."
    };
  }

  // Removing all spaces and line breaks.
  const cleanedHtml = pronoteHtml.replace(/ /ug, "").replace(/\n/ug, "");

  // Find the relaxed JSON of session data.
  const from = "Start(";
  const to = ")}catch";

  // Get that relaxed JSON.
  const dataToFix = cleanedHtml.substring(
    cleanedHtml.indexOf(from) + from.length,
    cleanedHtml.indexOf(to)
  );

  // Convert the relaxed JSON to a parsable JSON.
  const sessionData = dataToFix
    .replace(/(['"])?([a-z0-9A-Z_]+)(['"])?:/gu, "\"$2\": ")
    .replace(/'/gu, "\"");

  // Return parsed session data.
  try {
    return {
      success: true,
      session: JSON.parse(sessionData)
    };
  }
  catch (e) {
    return {
      success: false,
      message: "Erreur lors du parsing JSON.",
      debug: sessionData
    };
  }
}
