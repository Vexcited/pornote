import type { InformationsResponseData } from "types/ApiData";
import type { AccountType, SchoolInformations } from "types/SavedAccountData";

import fixSchoolName from "@/webUtils/fixSchoolName";

export default async function getAccountTypesFrom (
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
  if (rawData.success && rawData.data) {
    const typesAvailable = rawData.data.donneesSec.donnees.espaces.V;

    // Retreive account types.
    typesAvailable.forEach(type => {
      types.push({
        id: type.G,
        name: type.L,
        path: type.url
      });
    });

    // Retreive school name.
    schoolName = rawData.data.donneesSec.donnees.NomEtablissement;
  }

  return {
    name: fixSchoolName(schoolName), // Fixing a typo in schools name.
    entAvailable: false,
    availableAccountTypes: types
  };
}