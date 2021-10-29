import type { InformationsResponseData } from "types/LocalApiData";

type RenamedAccountType = {
  id: number;
  name: string;
  url: string;
};

export default async function getAccountTypesFrom (
  pronoteUrl: string
): Promise<RenamedAccountType[]> {
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
  const types: RenamedAccountType[] = [];
  
  if (rawData.success && rawData.data) {
    const typesAvailable = rawData.data?.donneesSec?.donnees.espaces.V;

    typesAvailable.forEach((type) => {
      types.push({
        id: type.G,
        name: type.L,
        url: type.url
      });
    });
  }

  return types;
}