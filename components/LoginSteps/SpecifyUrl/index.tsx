import type { PronoteGeolocationResult } from "types/PronoteData";

import { useState } from "react";

import getPosition from "@/webUtils/getLocation";

import {
  Button,
  TextField,
  Select,
  FormControl,
  InputLabel,

  MenuItem
} from "@mui/material";

export function SpecifyUrl ({
  pronoteUrl,
  setPronoteUrl
}: {
  pronoteUrl: string;
  setPronoteUrl: (value: string) => void;
}) {
  const [geoResults, setGeoResults] = useState<
    PronoteGeolocationResult[]
  >([]);
  const [showManual, setShowManual] = useState(true);

  const handleGeolocation = async () => {
    if ("geolocation" in navigator) {
      const {
        coords: { longitude, latitude }
      } = await getPosition();
 
      // We try to get a response from Pronote.
      const pronoteResponse = await fetch(
        // URL from the Pronote APK. 
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

      // Store results !
      setGeoResults(data);
    }
    else {
      alert ("Geolocation is not supported in your browser.");
    }
 }


  return (
    <div>
      <Button
        variant="contained"
        onClick={handleGeolocation}
      >
        Me géolocaliser
      </Button>

      <FormControl fullWidth>
        <InputLabel id="pronoteGeolocation">
          Choisir son établissement
         </InputLabel>
         <Select
          labelId="pronoteGeolocation"
          label="Choisir son établissement"
          defaultValue="manual"
          onChange={({ target }) => {
            if (target.value === "manual") {
              setShowManual(true);
            }
            else {
              setShowManual(false);
              setPronoteUrl(target.value);
            }
          }}
        >
          <MenuItem value="manual">
            Manuel
          </MenuItem>
          {geoResults.map(result =>
            <MenuItem
              key={`${result.latitude-result.longitude}`}
              value={result.url}
            >
              {result.nomEtab} ({result.cp})
            </MenuItem>
          )}
        </Select>
      </FormControl>
  
      {showManual &&
        <TextField
          label="URL Pronote"
          value={pronoteUrl}
          onChange={({ target }) => setPronoteUrl(
            target.value
          )}
        />
      }
    </div>
  );
}
