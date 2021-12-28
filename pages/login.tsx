import type { AccountType, SchoolInformations } from "types/SavedAccountData";

import { Fragment, useState } from "react";
import { NextSeo } from "next-seo";
import NextLink from "next/link";

import { BiArrowBack } from "react-icons/bi";

export type StateTypes = {
  step: // Steps to know where we are in the login form.
  | "selectSchoolSelection" // Step 1 - How we know Pronote server's URL.
  | "specifyUrlGeolocation" | "specifyUrlManual" // Step 2 - Specify Pronote server's URL.
  | "selectLoginSelection" // Step 3 - Login to Pronote with credentials or ENT.
  | "specifyPronoteCredentials" | "specifyEntCredentials"; // Step 4 - Pronote or ENT credentials.

  pronoteUrl: string;
  schoolInformations: SchoolInformations;

  accountType: AccountType;
  username: string;
  password: string;
}

import SelectSchoolSelection from "components/LoginSteps/SelectSchoolSelection"; // Step 1
import SpecifyUrlGeolocation from "components/LoginSteps/SpecifyUrlGeolocation"; // Step 2-1
import SpecifyUrlManual from "components/LoginSteps/SpecifyUrlManual"; // Step 2-2
import SelectLoginSelection from "components/LoginSteps/SelectLoginSelection"; // Step 3

export default function Home () {
  const [state, setState] = useState<StateTypes>({
    step: "selectSchoolSelection",
    pronoteUrl: "",

    schoolInformations: {
      name: "",
      entAvailable: false,
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

  return (
    <Fragment>
      <NextSeo
        title="Connexion"
      />

      <div
        className="
          h-screen w-screen
          flex flex-col items-center justify-center
          bg-green-50 text-green-900
        "
      >
        <header className="fixed top-0 w-full p-6">
          <NextLink href="/">
            <a className="
              font-medium px-4 py-2 rounded
              flex-row items-center inline-flex gap-2
              hover:bg-green-200 hover:bg-opacity-60 transition-colors
            ">
              <BiArrowBack size={18} />
              Revenir à la page d&apos;accueil
            </a>
          </NextLink>
        </header>

        <section className="
          h-full w-full py-24 px-4
          flex flex-col justify-center items-center
          gap-8
        ">
          <div className="
            flex flex-col justify-center items-center
          ">
            <h1 className="text-2xl font-medium">Connexion Pronote</h1>
            <p className="text-lg">
              Connectez vous à votre compte Pronote, ci-dessous.
            </p>
          </div>

          {/* 1st step: Choose how you specify the Pronote's server URL. */}
          {state.step === "selectSchoolSelection"
            && <SelectSchoolSelection
              state={state}
              setState={setState}
            />
          }


          {/* 2nd-1 step: Pronote's geolocation to locate servers URL. */}
          {state.step === "specifyUrlGeolocation"
            && <SpecifyUrlGeolocation
              state={state}
              setState={setState}
            />
          }

          {/* 2nd-2 step: Manual input of Pronote's server URL. */}
          {state.step === "specifyUrlManual"
            && <SpecifyUrlManual
              state={state}
              setState={setState}
            />
          }
          

          {/*
            OPTIONAL: 3rd step: Login with ENT or Pronote's Credentials.
            - Can be skipped if ENT isn't supported.
          */}
          {state.step === "selectLoginSelection"
            && <SelectLoginSelection
              state={state}
              setState={setState}
            />
          }
        </section>
      </div>
    </Fragment>
  );
}
