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
        <title>Connexion - Pronote Evolution</title>
      </Head>

      <h1>Connexion Pronote</h1>
      <p>
        Connectez vous à votre compte Pronote, ci-dessous.
      </p>

      <SpecifyUrl
        pronoteUrl={pronoteUrl}
        setPronoteUrl={setPronoteUrl}
      />

      {/* Provide a REGEX for this specific domain name. */}
      {pronoteUrl.includes("index-education.net/pronote") // Check if origin is safe.
        && <React.Fragment>
          <p>
            En continuant, vous vous
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
