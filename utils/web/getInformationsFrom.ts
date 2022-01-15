import type { InformationsResponseData } from "types/ApiData";
import type { AccountType, SchoolInformations } from "types/SavedAccountData";

import fixSchoolName from "@/webUtils/fixSchoolName";

export default async function getInformationsFrom (
  pronoteUrl: string
): Promise<SchoolInformations> {

  const response = await fetch(
    "/api/informations",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        pronoteUrl
      })
    }
  );

  // Get (raw) JSON data from the response.
  const rawData: InformationsResponseData = await response.json();

  // Initializing default returned values.
  const types: AccountType[] = [];
  let schoolName = "";

  // Check if the request was successful.
  if (rawData.success && rawData.pronoteData) {
    const typesAvailable = rawData.pronoteData.donneesSec.donnees.espaces.V;

    // Retrieve account types.
    typesAvailable.forEach(type => {
      types.push({
        id: type.G,
        name: type.L,
        path: type.url
      });
    });

    // Retrieve school name.
    schoolName = rawData.pronoteData.donneesSec.donnees.NomEtablissement;
  }

  return {
    name: fixSchoolName(schoolName),
    availableAccountTypes: types,
    entUrl: rawData.pronoteEntUrl
  };
}