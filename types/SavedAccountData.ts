import type {
  ApiInformationsResponse,
  ApiUserResponse
} from "types/ApiData";

import type {
  PronoteSession,
  PronoteApiFonctionParametresStudent
} from "types/PronoteApiData";


export type AccountType = {
  id: number;
  name: string;
  path: string;
};

export type EntData = {
  url: string;
  name: string;
};

export type SchoolInformations = {
  name: string;
  entUrl?: string;
  availableAccountTypes: AccountType[];
}

export type AccountMetadata = {
  name: string
  accountType: AccountType;
}

export type SavedAccountData = {
  currentSessionData: {
    iv: string;
    key: Uint8Array;
    session: PronoteSession;
  }

  /** Response of 'FonctionParametres'. */
  schoolInformations: 
    | PronoteApiFonctionParametresStudent["donneesSec"]["donnees"];

  /** Response of 'ParametresUtilisateur'. */
  userInformations: ApiUserResponse["pronoteData"];
};