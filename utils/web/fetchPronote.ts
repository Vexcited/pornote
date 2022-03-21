import type {
  ApiCommonInformationsResponse,
  ApiServerError
} from "types/ApiData";

import type {
  AccountType,
  SchoolInformations
} from "types/SavedAccountData";

import ky, { HTTPError } from "ky";
import fixSchoolName from "@/webUtils/fixSchoolName";

type RequestFail = {
  success: false;
  message: string;
  debug?: any;
};

interface RequestSuccess {
  success: true;
}

interface GetCommonInformationsFromSuccess extends RequestSuccess {
  data: SchoolInformations;
}

export async function getCommonInformationsFrom (
  pronoteUrl: string
): Promise<GetCommonInformationsFromSuccess | RequestFail> {
  try {
    const data = await ky.post("/api/common_informations", {
      json: { pronoteUrl }
    }).json<ApiCommonInformationsResponse>();

    // Initializing default returned values.
    const types: AccountType[] = [];
    const schoolName = data.request.data.donnees.NomEtablissement;

    // Account types available.
    const typesAvailable = data.request.data.donnees.espaces.V;
    typesAvailable.forEach(type => {
      types.push({
        id: type.G,
        name: type.L,
        path: type.url
      });
    });

    return {
      success: true,
      data: {
        name: fixSchoolName(schoolName),
        availableAccountTypes: types,
        entUrl: data.pronoteEntUrl
      }
    };
  }
  catch (e) {
    if (e instanceof HTTPError) {
      const body: ApiServerError = await e.response.json();
      return {
        success: false,
        message: body.message,
        debug: body.debug
      };
    }

    return {
      success: false,
      message: "Erreur inconnue.",
      debug: e
    };
  }
}