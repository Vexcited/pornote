import type { PronoteFonctionParametres } from "types/PronoteData";

export interface ApiServerError {
  success: false;
  message: string;
  debug?: any;
}

export interface InformationsResponseData {
  success: boolean;

  /** Server's response. */
  pronoteData: PronoteFonctionParametres;
  pronoteEntUrl?: string;
}