import type { StateTypes } from "pages/login";
import type { SchoolInformations } from "types/SavedAccountData";

import {
  useState,

  // Types
  Dispatch,
  SetStateAction
} from "react";

import getInformationsFrom from "@/webUtils/getInformationsFrom";

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
  const handlePronoteConnect = async () => {
    if (pronoteUrl) {
      const [success, data] = await getInformationsFrom(pronoteUrl);
      if (success) {
        const schoolInformations = data as SchoolInformations;

        setState({
          ...state,
          schoolInformations
        });
      }
      else {
        console.error("Error while getting informations from Pronote.", data);
      }
    }
  };

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
          <input type="text" onChange={(e => setPronoteUrl(e.target.value))} value={pronoteUrl} />

          <button type="submit">
            Connexion
          </button>
        </form>
      </div>

    </div>
  );
}

export default SpecifyUrlManual;