import type {
  PronoteApiFonctionParametresCommon,
  PronoteApiFonctionParametresStudent,
  PronoteApiIdentification,
  PronoteApiAuthentication,
  PronoteApiUserDataStudent,
  PronoteSession
} from "types/PronoteApiData";

import type {
  RequestSuccess
} from "@/apiUtils/request";

export interface ApiServerError {
  success: false;
  message: string;
  debug?: any;
}

export interface ApiCommonInformationsResponse {
  success: true;

  request: RequestSuccess<PronoteApiFonctionParametresCommon>;
  pronoteEntUrl?: string;
}

export interface ApiInformationsResponse {
  success: true;

  /** Server's response. */
  pronoteData: RequestSuccess<
    | PronoteApiFonctionParametresCommon
    | PronoteApiFonctionParametresStudent
  >;

  /** Keys used when authenticating. */
  pronoteCryptoInformations: {
    iv: string;
    session: PronoteSession;
  };

  pronoteHtmlCookie?: string;
}

export interface ApiIdentificationResponse {
  success: true;

  /** Server's response. */
  pronoteData: RequestSuccess<PronoteApiIdentification>;
}

export interface ApiAuthenticationResponse {
  success: true;

  /** Server's response. */
  pronoteData: RequestSuccess<PronoteApiAuthentication>;
}

export interface ApiUserResponse {
  success: true;

  /** Server's response. */
  pronoteData: RequestSuccess<PronoteApiUserDataStudent>;
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