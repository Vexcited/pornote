import type {
  PronoteApiFonctionParametresCommon,
  PronoteApiFonctionParametresStudent,
  PronoteApiIdentification,
  PronoteApiAuthentication,
  PronoteApiUserDataStudent,
  PronoteSession
} from "types/PronoteApiData";

export interface ApiServerError {
  success: false;
  message: string;
  debug?: any;
}

export type ApiRequestResponse<T> = {
  error: any;
  usedOrder: [string, number];
  returnedOrder?: [string, number];
  data: T | null;
}

export interface ApiInformationsResponse {
  success: true;

  /** Server's response. */
  pronoteData: ApiRequestResponse<
    | PronoteApiFonctionParametresCommon
    | PronoteApiFonctionParametresStudent
  >;
  pronoteEntUrl?: string;

  /** Keys used when authenticating. */
  pronoteCryptoInformations?: {
    iv: string;
    session: PronoteSession;
  };

  pronoteHtmlCookie?: string;
}

export interface ApiIdentificationResponse {
  success: true;

  /** Server's response. */
  pronoteData: ApiRequestResponse<PronoteApiIdentification>;
}

export interface ApiAuthenticationResponse {
  success: true;

  /** Server's response. */
  pronoteData: ApiRequestResponse<PronoteApiAuthentication>;
}

export interface ApiUserResponse {
  success: true;

  /** Server's response. */
  pronoteData: ApiRequestResponse<
    | PronoteApiUserDataStudent
  >;
  pronoteLoginCookie?: string;
}

export interface ApiGetEntCookiesResponse {
  success: true;
  entCookies: string[];
}

export interface ApiGetPronoteTicketResponse {
  success: true;
  pronoteUrl: string;
}