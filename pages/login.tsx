import type { PronoteGeolocationResult } from "types/PronoteData";

import Head from "next/head";
import React from "react";

import {
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from "@mui/material";

import getPosition from "@/webUtils/getLocation";
import isURL from "validator/es/lib/isURL";

export default function Home () {
  const [pronoteUrl, setPronoteUrl] = React.useState("");
  const [geolocationResults, setGeolocationResults] = React.useState<PronoteGeolocationResult[]>([]);
  const [showManual, setShowManual] = React.useState(true);

  const initializeSession = async (): Promise<void> => {
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
    const data = await response.json();

    if (data.success) {
     // setSession(data.session.h);
    }
    else {
      // setSession("Erreur");
    }
  }

 /**
  * Geolocate yourself and puts the results in 
  * `geolocationResults` state.
  */
  const getGeolocationResults = async () => {
    if ("geolocation" in navigator) {
      const { 
        coords: { longitude, latitude }
      } = await getPosition();
      
      // We try to get a response from Pronote.
      const pronoteResponse = await fetch(
        "https://www.index-education.com/swie/geoloc.php", // URL from the Pronote APK.
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

      setGeolocationResults(data);
    }
    else {
      alert ("Geolocation is not supported in your browser.");
    }
  }

  return (
    <div>
      <Head>
        <title>Pronote Evolution</title>
        <meta name="description" content="Re-design de Pronote, avec de nouvelles fonctionnalités." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <h1>
        Pronote Évolution
      </h1>
      <p>
        Connectez vous à votre compte Pronote, ci-dessous.
      </p>

      <Button
        variant="outlined"
        onClick={getGeolocationResults}
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
          {geolocationResults.map((result, key) => 
            <MenuItem
              key={key}
              value={result.url}
            >
              {result.nomEtab} ({result.cp})
            </MenuItem>
          )}
        </Select>
      </FormControl>

      {showManual &&
        <TextField
          type="text"
          value={pronoteUrl}
          label="URL Pronote"
          onChange={({ target }) => setPronoteUrl(
            target.value
          )}
        />
      }

      {isURL(pronoteUrl)
        && <React.Fragment>
          <p>
            En cliquant sur "Confirmer", vous vous
            connecterez au serveur Pronote de
            {" "}<strong>{pronoteUrl}</strong>.
          </p>

          <Button
            onClick={initializeSession}
            variant="contained"
          >
            Continuer
          </Button>
        </React.Fragment>
      }
    </div>
  )
}
