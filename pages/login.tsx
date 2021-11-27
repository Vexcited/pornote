import type { AccountType, SchoolInformations } from "types/SavedAccountData";

import { Fragment, useState } from "react";
import { NextSeo } from "next-seo";
import NextLink from "next/link";

import { BiArrowBack } from "react-icons/bi";

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
  | 0 | 1 | 2
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
  };

  return (
    <Fragment>
      <NextSeo
        title="Connexion"
      />
      <div
        className="h-screen w-screen flex flex-col items-center justify-center bg-green-50 text-green-900"
      >

        <header className="fixed top-0 w-full p-6">
          <NextLink href="/">
            <a className="
              flex-row items-center font-medium gap-2
              hover:bg-green-200 hover:bg-opacity-60 transition-colors
              inline-flex px-4 py-2 rounded
            ">
              <BiArrowBack size={18} /> Revenir à la page d&apos;accueil
            </a>
          </NextLink>
        </header>

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
    </Fragment>
  );
}
