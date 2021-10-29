import type { AccountType } from "types/SavedAccountData";

import Head from "next/head";
import React, { useState } from "react";

import {
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from "@mui/material";

import {
  SpecifyUrl, // 0
  SpecifyAccountType // 1
} from "components/LoginSteps";
import getAccountTypesFrom from "@/webUtils/getAccountTypesFrom";

export default function Home () {
  const [pronoteUrl, setPronoteUrl] = useState("");

  // Defined in step 1 (SpecifyAccountType).
  const [pronoteAccountType, setPronoteAccountType] = useState<AccountType | null>(null);
  const [pronoteAccountTypes, setPronoteAccountTypes] = useState<AccountType[]>([]);

  /**
   * 0 => SpecifyUrl
   * 1 => SpecifyAccountType
   * 2 => SpecifyCredentials
   */
  const [currentLoginStep, setLoginStep] = useState<0 | 1 | 2>(0);

  // (0) - SpecifyUrl
  const LoginStep0 = () => {
    const getAccountTypes = async () => {
      const accountTypes = await getAccountTypesFrom(pronoteUrl);
      
      // We save the account types for use in step 1.
      setPronoteAccountTypes(accountTypes);

      // Go to step 1.
      setLoginStep(1);
    };

    return (
      <React.Fragment>
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
      </React.Fragment>
    )
  };

  const LoginStep1 = () => {

    return (
      <React.Fragment>
        <SpecifyAccountType 
          pronoteAccountTypes={pronoteAccountTypes}
          pronoteAccountType={pronoteAccountType}
          setPronoteAccountType={setPronoteAccountType}
        />
      </React.Fragment>
    );
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

      {currentLoginStep === 0 && <LoginStep0 />}
      {currentLoginStep === 1 && <LoginStep1 />}
      
    </div>
  )
}
