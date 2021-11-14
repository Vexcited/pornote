import type { AccountType, SchoolInformations } from "types/SavedAccountData";

import Head from "next/head";
import React, { useState } from "react";

export type StateTypes = {
  step: 0 | 1 | 2;
    
  pronoteUrl: string;
  schoolInformations: SchoolInformations;
  
  accountType: AccountType;
  username: string;
  password: string;
}

export type UpdateStateType = (
  key: keyof StateTypes,
  value: string
  | number
  | AccountType[]
  | AccountType
  | SchoolInformations
) => void;

import {
  SpecifyUrl, // 0
  SpecifyAccountType, // 1
  SpecifyCredentials // 2
} from "components/LoginSteps";

export default function Home () {
  const [state, setState] = useState<StateTypes>({
    step: 0,
    pronoteUrl: "",

    schoolInformations: {
      name: "",
      availableAccountTypes: []
    },

    accountType: {
      id: 0,
      name: "",
      path: ""
    },
    username: "",
    password: ""
  });

  const updateState: UpdateStateType = (key, value) => {
    setState({
      ...state,
      [key]: value
    });
  }

  return (
    <div>
      <Head>
        <title>Connexion - Pronote Evolution</title>
      </Head>

      

      <div
        className="flex flex-col items-center"
      >
        <h1>Connexion Pronote</h1>
        <p>
          Connectez vous à votre compte Pronote, ci-dessous.
        </p>

        {state.step === 0
          && <SpecifyUrl
          state={state}
          updateState={updateState}
          />
        }

        {state.step === 1
          && <SpecifyAccountType
          state={state}
          updateState={updateState}
          />
        }

        {state.step === 2
          && <SpecifyCredentials
          state={state}
          updateState={updateState}
          />
        }
      </div>
    </div>
  )
}
