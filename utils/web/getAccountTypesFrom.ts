import type { InformationsResponseData } from "types/LocalApiData";
import type { AccountType } from "types/SavedAccountData";

export default async function getAccountTypesFrom (
  pronoteUrl: string
): Promise<AccountType[]> {
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

  const rawData: InformationsResponseData = await response.json();
  const types: AccountType[] = [];
  
  if (rawData.success && rawData.data) {
    const typesAvailable = rawData.data?.donneesSec?.donnees.espaces.V;

    typesAvailable.forEach((type) => {
      types.push({
        id: type.G,
        name: type.L,
        path: type.url
      });
    });
  }

  return types;
}