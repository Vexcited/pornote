import type {
  ApiInformationsResponse
} from "types/ApiData";

import type {
  PronoteApiFonctionParametresCommon
} from "types/PronoteApiData";

import type {
  AccountType,
  SchoolInformations
} from "types/SavedAccountData";

import ky, { HTTPError } from "ky";
import fixSchoolName from "@/webUtils/fixSchoolName";

export default async function getInformationsFrom (
  pronoteUrl: string
): Promise<[boolean, SchoolInformations | string]> {
  try {
    const data = await ky.post("/api/informations", {
      json: { pronoteUrl }
    }).json<ApiInformationsResponse>();

    // Fix the typing as we're only requesting 'common' account type.
    const pronoteData = data.pronoteData as PronoteApiFonctionParametresCommon;

    // Initializing default returned values.
    const types: AccountType[] = [];
    const schoolName = pronoteData.donneesSec.donnees.NomEtablissement;

    // Account types available.
    const typesAvailable = pronoteData.donneesSec.donnees.espaces.V;
    typesAvailable.forEach(type => {
      types.push({
        id: type.G,
        name: type.L,
        path: type.url
      });
    });

    return [true, {
      name: fixSchoolName(schoolName),
      availableAccountTypes: types,
      entUrl: data.pronoteEntUrl
    }];
  }
  catch (e) {
    const error = e as HTTPError;
    return [false, error.message];
  }
}