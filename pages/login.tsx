import type {
  AccountType,
  SchoolInformations
} from "types/SavedAccountData";

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

  // Get from step 1.
  pronoteUrl: string;

  // On submit from step 1.
  schoolInformations: SchoolInformations;

  accountType: AccountType;
  username: string;
  password: string;
}

// Step 1.
import SelectSchoolSelection from "components/LoginSteps/SelectSchoolSelection";

// Step 2-1 and 2-2.
import SpecifyUrlGeolocation from "components/LoginSteps/SpecifyUrlGeolocation";
import SpecifyUrlManual from "components/LoginSteps/SpecifyUrlManual";

// Step 3.
import SelectLoginSelection from "components/LoginSteps/SelectLoginSelection";

export default function Home () {
  const [state, setState] = useState<StateTypes>({
    step: "selectSchoolSelection",
    pronoteUrl: "",

    schoolInformations: {
      name: "",
      entUrl: undefined,
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

      <header className="fixed top-0 w-full p-6">
        <NextLink href="/">
          <a className="
            font-medium px-4 py-2 rounded
            flex-row items-center inline-flex gap-2
            text-green-50 bg-green-900 bg-opacity-60
            hover:bg-opacity-80 transition-colors
          ">
            <BiArrowBack size={18} />
            Revenir à la page d&apos;accueil
          </a>
        </NextLink>
      </header>

      <div
        className="
          h-screen w-screen
          bg-green-800 text-green-50
        "
      >
        <section className="
          h-full w-full md:fixed md:right-0 md:w-2/5 pt-24 px-4
          flex flex-col
          gap-8 bg-green-900 bg-opacity-80 rounded-l-xl
        ">
          <div className="
            flex flex-col
            items-center
            md:items-start
          ">
            <h1 className="text-2xl font-medium">Connexion</h1>
            <p className="text-lg">
              {
                state.step === "selectSchoolSelection"
                || state.step === "specifyUrlGeolocation"
                || state.step === "specifyUrlManual" ?
                  "URL Pronote" :
                  state.step === "selectLoginSelection"
                || state.step === "specifyEntCredentials"
                || state.step === "specifyPronoteCredentials" ?
                    "S'identifier"
                    : ""
              }
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
