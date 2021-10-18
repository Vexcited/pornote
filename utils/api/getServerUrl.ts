import { URL } from "url";

export default function getServerUrl (
  pronoteUrl: string
): string {
  const parsed = new URL(pronoteUrl);

  return parsed.origin + "/pronote/";
}
