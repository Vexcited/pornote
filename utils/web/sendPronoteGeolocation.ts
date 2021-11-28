import { PronoteGeolocationResult } from "types/PronoteData";

export default async function sendPronoteGeolocation (latitude: number, longitude: number) {
  const pronoteResponse = await fetch(
    "https://www.index-education.com/swie/geoloc.php",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
      },
      body: `data=${JSON.stringify({
        nomFonction: "geoLoc", // Geolocation
        lat: latitude.toString(),
        long: longitude.toString()
      })}`
    }
  );
  
  // We get the response.
  // If the data isn't an array (no results),
  // then we create it ourselves (prevent errors).
  const pronoteDataRaw = await pronoteResponse.json();
  const data: PronoteGeolocationResult[] = Array.isArray(pronoteDataRaw) ? pronoteDataRaw : [];

  return data;
}