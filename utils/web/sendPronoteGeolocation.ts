import type {
  PronoteApiGeolocationItem
} from "types/PronoteApiData";

import ky, { HTTPError } from "ky";

export default async function sendPronoteGeolocation (latitude: number, longitude: number) {
  try {
    const geolocationResponse = await ky.post("/proxy/geolocation", {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
      },
      body: `data=${JSON.stringify({
        nomFonction: "geoLoc", // Geolocation
        lat: latitude.toString(),
        long: longitude.toString()
      })}`
    }).json();

    // If the data isn't an array (no results),
    // then we create it ourselves (to prevent error).
    const items: PronoteApiGeolocationItem[] = Array.isArray(geolocationResponse) ? geolocationResponse : [];
    return items;
  }
  catch (e) {
    const error = e as HTTPError;
    console.error(error);

    return [];
  }
}
