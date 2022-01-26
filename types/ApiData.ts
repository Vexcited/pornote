import type {
  PronoteApiFonctionParametresCommon,
  PronoteApiFonctionParametresStudent,
  PronoteApiIdentification,
  PronoteSession
} from "types/PronoteApiData";

export interface ApiServerError {
  success: false;
  message: string;
  debug?: any;
}

export interface ApiInformationsResponse {
  success: true;

  /** Server's response. */
  pronoteData:
    | PronoteApiFonctionParametresCommon
    | PronoteApiFonctionParametresStudent;
  pronoteEntUrl?: string;
  
  /** Keys used when authenticating. */
  pronoteCryptoInformations?: {
    iv: string;
    session: PronoteSession;
  };
}

export interface ApiIdentificationResponse {
  success: true;

  /** Server's response. */
  pronoteData: PronoteApiIdentification;
}