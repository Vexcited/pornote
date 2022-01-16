import type {
  PronoteApiFonctionParametres
} from "types/PronoteApiData";

export interface ApiServerError {
  success: false;
  message: string;
  debug?: any;
}

export interface ApiInformationsResponse {
  success: boolean;

  /** Server's response. */
  pronoteData: PronoteApiFonctionParametres;
  pronoteEntUrl?: string;
}

export interface ApiLoginResponse {
  success: boolean;

  /** Server's response. */
  pronoteData: any;
}