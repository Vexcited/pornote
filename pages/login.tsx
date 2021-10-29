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
import { SpecifyUrl } from "components/LoginSteps/SpecifyUrl";

export default function Home () {
  const [pronoteUrl, setPronoteUrl] = React.useState("");
  const [session, setSession] = React.useState({
    sessionId: ""
  });

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
      setSession({ 
        sessionId: data.session.h
      })
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

      <SpecifyUrl
        pronoteUrl={pronoteUrl}
        setPronoteUrl={setPronoteUrl}
      />

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

      {/* Provide a REGEX for this specific domain name. */}
      {pronoteUrl.includes("index-education.net/pronote") // Check if origin is safe.
        && <React.Fragment>
          <p>
            En cliquant sur "Continuer", vous vous
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
