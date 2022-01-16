import type { ApiInformationsResponse } from "types/ApiData";
import type { AccountType, SchoolInformations } from "types/SavedAccountData";

import fixSchoolName from "@/webUtils/fixSchoolName";

import ky, { HTTPError } from "ky";

export default async function getInformationsFrom (
  pronoteUrl: string
): Promise<[boolean, SchoolInformations | string]> {
  try {
    const data = await ky.post("/api/informations", {
      json: { pronoteUrl }
    }).json<ApiInformationsResponse>();

    // Initializing default returned values.
    const types: AccountType[] = [];
    const schoolName = data.pronoteData.donneesSec.donnees.NomEtablissement;

    const typesAvailable = data.pronoteData.donneesSec.donnees.espaces.V;

    // Retrieve account types.
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