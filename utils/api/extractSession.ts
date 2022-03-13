import type { PronoteSession } from "types/PronoteApiData";

export default function extractSession (
  pronoteHtml: string
): PronoteSession | null {
  if (pronoteHtml.includes("Votre adresse IP est provisoirement suspendue")) {
    throw Error("TempBanIp");
  }

  if (pronoteHtml.includes("Le site n'est pas disponible")) {
    throw Error("PronoteClosed");
  }

  // Removing all spaces and line breaks.
  const cleanedHtml = pronoteHtml.replace(/ /ug, "").replace(/\n/ug, "");

  // Find the relaxed JSON containing
  // the session datas we want.
  const from = "Start(";
  const to = ")}catch";

  // Get that relaxed JSON.
  const dataToFix = cleanedHtml.substring(
    cleanedHtml.indexOf(from) + from.length,
    cleanedHtml.indexOf(to)
  );

  // Convert the relaxed JSON to a parsable JSON.
  const sessionData = dataToFix.
    replace(/(['"])?([a-z0-9A-Z_]+)(['"])?:/gu, "\"$2\": ").
    replace(/'/gu, "\"");

  // Return the parsed JSON.
  try {
    return JSON.parse(sessionData);
  }
  catch (e) {
    console.error(e);
    return null;
  }
}
