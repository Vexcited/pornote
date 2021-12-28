import type { PronoteGeolocationResult } from "types/PronoteData";
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

type SpecifyUrlGeolocationProps = {
  state: StateTypes;
  setState: Dispatch<SetStateAction<StateTypes>>;
}

function SpecifyUrlGeolocation ({ state, setState }: SpecifyUrlGeolocationProps) {
  const [geolocationResults, setGeolocationResults] = useState<PronoteGeolocationResult[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<PronoteGeolocationResult | null>(null);

  // On component mount, start Pronote's geolocation.
  useEffect(() => {
    /**
     * Function to send our geolocation to Pronote API
     * and gets the nearest schools.
     *
     * We need also to check if geolocation is supported
     * in the user's navigator.
     */
    const handleGeolocation = async () => {
      if ("geolocation" in navigator) {
        const {
          coords: { longitude, latitude }
        } = await getPosition();

        const data = await sendPronoteGeolocation(latitude, longitude);
        setGeolocationResults(data);
        setSelectedSchool(data[0]);
      }
      else {
        alert("La géolocalisation n'est pas disponible dans votre navigateur.");
      }
    };

    handleGeolocation();
  }, []);

  /**
   * Function to parse the informations
   * gathered on the `pronoteUrl`'s home page.
   */
  const handlePronoteConnect = async () => {
    if (selectedSchool) {
      const schoolInformations = await getInformationsFrom(selectedSchool.url);
      console.log(schoolInformations);

      // We save these informations that will trigger the useEffect below.
      // updateState("schoolInformations", schoolInformations);
    }
  };

  return (
    <div className="
      flex flex-col justify-center items-center
      min-w-lg rounded-md p-8 gap-4
      bg-green-200 bg-opacity-60
    ">
      <div className="flex flex-col text-center">
        <h2 className="text-lg font-medium">Géolocalisation</h2>
        <p>Choissisez votre établissement dans la liste ci-dessous</p>
      </div>
      {selectedSchool ? (
        <Listbox value={selectedSchool} onChange={setSelectedSchool}>
          <div className="relative mt-1 w-full">
            <Listbox.Button
              className="
                relative w-full py-2 pl-3 pr-10 text-left
                bg-white rounded-lg shadow-md cursor-default
                focus:outline-none focus-visible:ring-2
                focus-visible:ring-opacity-75 focus-visible:ring-white
                focus-visible:ring-offset-orange-300 focus-visible:ring-offset-2
                focus-visible:border-green-500 sm:text-sm
              "
            >
              <span className="block truncate">{selectedSchool.nomEtab}</span>
              <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <HiSelector
                  className="w-5 h-5 text-gray-400"
                  aria-hidden="true"
                />
              </span>
            </Listbox.Button>
            <Transition
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options
                className="
                  absolute w-full py-1 mt-1 overflow-auto
                  text-base bg-white rounded-md shadow-lg
                  max-h-60 ring-1 ring-black
                  ring-opacity-5 focus:outline-none sm:text-sm
                "
              >
                {geolocationResults.map(result => (
                  <Listbox.Option
                    key={`${result.lat}-${result.long}`}
                    className={({ active }) =>
                      `${active ? "bg-green-50" : ""}
                      cursor-pointer select-none relative py-2 pl-10 pr-4`
                    }
                    value={result}
                  >
                    {({ selected, active }) => (
                      <Fragment>
                        <span
                          className={`${
                            selected ? "font-medium text-green-600" : "font-normal text-green-800"
                          } ${
                            active ? "text-green-700" : ""
                          } 
                            block truncate
                          `}
                        >
                          {result.nomEtab}
                        </span>

                        {selected ? (
                          <span
                            className={`${
                              active ? "text-green-700" : ""
                            } 
                              text-green-600 absolute inset-y-0 left-0 flex items-center pl-3
                            `}
                          >
                            <HiCheck className="w-5 h-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </Fragment>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </Listbox>
      ): (
        <Fragment>
          <p className="font-medium">Chargement...</p>
          <span>N&apos;oubliez pas d&apos;accepter la géolocalisation de votre appareil.</span>
        </Fragment>
      )}
    </div>
  );
}

export default SpecifyUrlGeolocation;