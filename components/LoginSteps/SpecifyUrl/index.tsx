import type { PronoteGeolocationResult } from "types/PronoteData";
import type { StateTypes, UpdateStateType } from "pages/login";

import { useState, useEffect } from "react";

import getPosition from "@/webUtils/getLocation";
import getAccountTypesFrom from "@/webUtils/getAccountTypesFrom";

import {
  Button,
  TextField,
  Select,
  FormControl,
  InputLabel,
  MenuItem
} from "@mui/material";

export function SpecifyUrl ({
  state,
  updateState
}: {
  state: StateTypes;
  updateState: UpdateStateType;
}) {
  const [geoResults, setGeoResults] = useState<PronoteGeolocationResult[]>([]);
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
  };

  const handlePronoteConnect = async () => {
    // We try to get account types from Pronote.
    const accountTypes = await getAccountTypesFrom(state.pronoteUrl);

    // We store the account types.
    // This will trigger the useEffect below.
    updateState("availableAccountTypes", accountTypes);
  };

  /**
   * Callback when the account types are changed.
   */
  useEffect(() => {
    // We check if the account types are available.
    if (state.availableAccountTypes.length > 0) {
      // We go to the next step.
      updateState("step", 1);
    }
  }, [state.availableAccountTypes]);

  return (
    <div>
      <Button
        variant="outlined"
        onClick={handleGeolocation}
      >
        Me géolocaliser
      </Button>

      <FormControl>
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
              updateState("pronoteUrl", target.value);
            }
          }}
        >
          <MenuItem value="manual">
            Manuel
          </MenuItem>
          {geoResults.map(school =>
            <MenuItem
              key={`${school.lat}-${school.long}`}
              value={school.url}
            >
              {school.nomEtab} ({school.cp})
            </MenuItem>
          )}
        </Select>
      </FormControl>
  
      {showManual &&
        <TextField
          label="URL Pronote"
          value={state.pronoteUrl}
          onChange={({ target }) => updateState("pronoteUrl", target.value)}
        />
      }

      {
        state.pronoteUrl.includes("index-education.net/pronote") &&
        <Button
          variant="contained"
          onClick={handlePronoteConnect}
        >
          Se connecter à ce serveur Pronote
        </Button>
      }
    </div>
  );
}
