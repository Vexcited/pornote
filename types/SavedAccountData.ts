import type {
  PronoteSession,
  PronoteApiFonctionParametresStudent,

  PronoteApiUserDataStudent
} from "types/PronoteApiData";

import type {
  AccountType
} from "@/apiUtils/accountTypes";

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
    loginCookie?: string;
    entCookies?: string[];
    entUrl?: string;
    pronoteUrl: string;
    usingEnt: boolean;
  }

  /** Response of 'FonctionParametres'. */
  schoolInformations:
    | PronoteApiFonctionParametresStudent["donnees"];

  /** Response of 'ParametresUtilisateur'. */
  userInformations:
    | PronoteApiUserDataStudent["donnees"];
}

export type PreloadedAccountData = {
  slug: string;
  data: SavedAccountData;
}