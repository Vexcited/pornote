import type { PronoteSession } from "types/PronoteSession";

export default function extractSession (
  pronoteHtml: string
): PronoteSession {
  if (pronoteHtml.includes("Votre adresse IP est provisoirement suspendue")) {
    throw Error("TempBanIp");
  }

  if (pronoteHtml.includes("Le site n'est pas disponible")) {
    throw Error("PronoteClosed");
  }

  // Removing all spaces and linebreaks (to clean).
  pronoteHtml = pronoteHtml.replace(/ /ug, "").replace(/\n/ug, "");

  // Find the relaxed JSON containing
  // the session datas we want.
  const from = "Start(";
  const to = ")}catch";

  // Get that relaxed JSON.
  const dataToFix = pronoteHtml.substring(pronoteHtml.indexOf(from) + from.length, pronoteHtml.indexOf(to));
  
  // Convert the relaxed JSON a parsable JSON.
  const sessionData = dataToFix.
    replace(/(['"])?([a-z0-9A-Z_]+)(['"])?:/gu, '"$2": ').
    replace(/'/gu, '"');

  // Return the parsed JSON.
  return JSON.parse(sessionData);
}
