import Head from "next/head";
import { useState } from "react";

import {
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from "@mui/material";

import { SpecifyUrl } from "components/LoginSteps/SpecifyUrl";
import getAccountTypesFrom from "@/webUtils/getAccountTypesFrom";

export default function Home () {
  const [pronoteUrl, setPronoteUrl] = useState("");

  /**
   * 0 => SpecifyUrl
   * 1 => SpecifyAccountType
   * 2 => SpecifyCredentials
   */
  const [currentLoginStep, setLoginStep] = useState<0 | 1 | 2>(0);


  // Executed when click Button at step 0 (SpecifyUrl).
  const getAccountTypes = async () => {
    const accountTypes = await getAccountTypesFrom(pronoteUrl);
    setLoginStep(1);

    console.log(accountTypes);
  };

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

      {/* TODO: Provide a REGEX to check origin (more safe). */}
      {pronoteUrl.includes("index-education.net/pronote") &&
        <Button
          onClick={getAccountTypes}
          variant="contained"
        >
          Continuer
        </Button>
      }
    </div>
  )
}
