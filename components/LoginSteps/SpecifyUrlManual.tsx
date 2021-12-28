import type { StateTypes } from "pages/login";

import {
  useState,
  useEffect,
  Fragment,

  // Types
  Dispatch,
  SetStateAction
} from "react";

import getPosition from "@/webUtils/getLocation";
import sendPronoteGeolocation from "@/webUtils/sendPronoteGeolocation";
import getInformationsFrom from "@/webUtils/getInformationsFrom";

import { Listbox, Transition } from "@headlessui/react";
import { HiCheck, HiSelector } from "react-icons/hi";

type SpecifyUrlManualProps = {
  state: StateTypes;
  setState: Dispatch<SetStateAction<StateTypes>>;
}

function SpecifyUrlManual ({ state, setState }: SpecifyUrlManualProps) {
  const [pronoteUrl, setPronoteUrl] = useState("");

  /**
   * Function to parse the informations
   * gathered on the `pronoteUrl`'s home page.
   */
  const handlePronoteConnect = async () => {
    const schoolInformations = await getInformationsFrom(pronoteUrl);
    console.log(schoolInformations);

    // We save these informations that will trigger the useEffect below.
    // updateState("schoolInformations", schoolInformations);
  };

  return (
    <div className="
      flex flex-col justify-center items-center
      min-w-lg rounded-md p-8 gap-4
      bg-green-200 bg-opacity-60
    ">
      <div className="flex flex-col text-center">
        <h2 className="text-lg font-medium">Manuel</h2>
        <p>Saissise</p>
      </div>

    </div>
  );
}

export default SpecifyUrlManual;