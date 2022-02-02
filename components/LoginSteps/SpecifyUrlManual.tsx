import type { StateTypes } from "pages/login";
import type { SchoolInformations } from "types/SavedAccountData";

import {
  useState,
  useEffect,

  // Types
  Dispatch,
  FormEvent,
  SetStateAction
} from "react";

import getInformationsFrom from "@/webUtils/getInformationsFrom";

/** Used on the `useEffect` to DRY with `SpecifyUrlGeolocation`. */
import specifyUrlCheckState from "./utils/specifyUrlCheckState";

import InputText from "components/InputText";
import Button from "components/Button";

type SpecifyUrlManualProps = {
  state: StateTypes;
  setState: Dispatch<SetStateAction<StateTypes>>;
}

function SpecifyUrlManual ({ state, setState }: SpecifyUrlManualProps) {
  const [pronoteUrl, setPronoteUrl] = useState("");

  /**
   * Parse the informations from the selected school.
   * Move to next step if the informations are valid.
   */
  const handlePronoteConnect = async (e: FormEvent<HTMLFormElement>) => {
    // Prevent a submit refresh.
    e.preventDefault();

    if (pronoteUrl) {
      const [success, data] = await getInformationsFrom(pronoteUrl);
      if (success) {
        const schoolInformations = data as SchoolInformations;

        setState({
          ...state,
          pronoteUrl,
          schoolInformations
        });
      }
      else {
        console.error("Error while getting informations from Pronote.", data);
      }
    }
  };

  /**
   * Move to next step if a school have been
   * selected in the state.
   */
  useEffect(() => {
    specifyUrlCheckState({
      state,
      setState
    });
  }, [state, setState]);

  return (
    <div className="
      flex flex-col justify-center items-center
      min-w-lg rounded-md p-8 gap-4
      bg-green-200 bg-opacity-60
    ">
      <div className="flex flex-col text-center">
        <h2 className="text-lg font-medium">Manuel</h2>
        <p>Saisissez l&apos;URL Pronote de votre établissement.</p>

        <form onSubmit={handlePronoteConnect}>
          <InputText
            id="manualPronoteUrl"
            label="URL Pronote"
            placeholder="https://xxxxxx.index-education.net/pronote/"
            value={pronoteUrl}
            onChange={e => setPronoteUrl(e.target.value)}
          />

          <Button
            isButton={true}
            buttonType="submit"
          >
            Connexion au serveur
          </Button>
        </form>
      </div>

    </div>
  );
}

export default SpecifyUrlManual;