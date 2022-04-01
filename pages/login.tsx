import type {
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
}

// Step 1.
import SelectSchoolSelection from "components/LoginSteps/SelectSchoolSelection";

// Step 2-1 and 2-2.
import SpecifyUrlGeolocation from "components/LoginSteps/SpecifyUrlGeolocation";
import SpecifyUrlManual from "components/LoginSteps/SpecifyUrlManual";

// Step 3.
import SelectLoginSelection from "components/LoginSteps/SelectLoginSelection";

// Step 4-1 and 4-2.
import SpecifyEntCredentials from "components/LoginSteps/SpecifyEntCredentials";
import SpecifyPronoteCredentials from "components/LoginSteps/SpecifyPronoteCredentials";

export default function Home () {
  const [state, setState] = useState<StateTypes>({
    step: "selectSchoolSelection",
    pronoteUrl: "",

    schoolInformations: {
      name: "",
      entUrl: undefined,
      availableAccountTypes: []
    }
  });

  return (
    <Fragment>
      <NextSeo
        title="Connexion"
      />

      <header className="fixed top-0 w-full p-6">
        <NextLink href="/">
          <a className="
            font-medium px-4 py-2 rounded-lg
            flex-row items-center inline-flex gap-2
            text-brand-white md:text-brand-dark
            dark:text-brand-white dark:md:text-brand-white
            md:bg-brand-light bg-brand-primary
            dark:md:bg-brand-dark dark:bg-brand-light
            hover:bg-opacity-40
            dark:text-opacity-60 dark:hover:text-opacity-80
            dark:bg-opacity-10 dark:hover:bg-opacity-30
            transition-colors
          ">
            <BiArrowBack size={18} />
            Annuler
          </a>
        </NextLink>
      </header>

      <div
        className="
          h-screen w-screen
          bg-brand-primary
        "
      >
        <section className="
          h-full w-full md:fixed md:right-0 md:w-[28rem] pt-28 md:pt-20 px-8
          flex flex-col gap-16
          bg-brand-light dark:bg-brand-dark
        ">
          <div className="
            flex flex-col
            items-center
          ">
            <h1 className="
              text-xl font-medium
              rounded-full px-4 py-2
              text-brand-light bg-brand-primary
              dark:text-brand-dark
            ">
              Connexion à Pronote
            </h1>
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
            - Can be skipped if ENT isn't available.
          */}
          {state.step === "selectLoginSelection"
            && <SelectLoginSelection
              state={state}
              setState={setState}
            />
          }

          {/* 4th-1 step: Form to login using Pronote credentials. */}
          {state.step === "specifyEntCredentials"
            && <SpecifyEntCredentials
              state={state}
              setState={setState}
            />
          }

          {/* 4th-2 step: Form to login using ENT credentials. */}
          {state.step === "specifyPronoteCredentials"
            && <SpecifyPronoteCredentials
              state={state}
            />
          }
        </section>
      </div>
    </Fragment>
  );
}
