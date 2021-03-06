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
  request: RequestSuccess<PronoteApiFonctionParametresStudent>;

  /** Keys used when authenticating. */
  pronoteCryptoInformations: {
    iv: string;
    session: PronoteSession;
  };

  pronote_setup_account_cookie_response_cookies?: string;
}

export interface ApiIdentificationResponse {
  success: true;

  /** Server's response. */
  request: RequestSuccess<PronoteApiIdentification>;
}

export interface ApiAuthenticationResponse {
  success: true;

  /** Server's response. */
  request: RequestSuccess<PronoteApiAuthentication>;
}

export interface ApiUserResponse {
  success: true;

  /** Server's response. */
  request: RequestSuccess<PronoteApiUserDataStudent>;
  pronoteLoginCookie?: string;
}

export interface ApiGetEntCookiesResponse {
  success: true;
  entCookies: string[];
}

export interface ApiGetPronoteTicketResponse {
  success: true;
  pronote_url: string;
}