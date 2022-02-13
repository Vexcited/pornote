import type { PronoteApiGeolocationItem } from "types/PronoteApiData";
import type { SchoolInformations } from "types/SavedAccountData";
import type { StateTypes } from "pages/login";

import {
  useState,
  useEffect,
  Fragment,

  // Types
  Dispatch,
  SetStateAction
} from "react";

import haversine from "haversine-distance";

import getPosition from "@/webUtils/getPosition";
import sendPronoteGeolocation from "@/webUtils/sendPronoteGeolocation";
import getInformationsFrom from "@/webUtils/getInformationsFrom";

/** Used on the `useEffect` to DRY with `SpecifyUrlManual`. */
import specifyUrlCheckState from "./utils/specifyUrlCheckState";

import { SelectInput, SelectInputOption } from "components/SelectInput";
import Button from "components/Button";

type PronoteApiGeolocationParsedItem = {
  /** Pronote URL. */
  url: string;
  /** Distance from current location in kilometers. */
  distance: number;
  name: string;
}

type SpecifyUrlGeolocationProps = {
  state: StateTypes;
  setState: Dispatch<SetStateAction<StateTypes>>;
}

/** Step 2-1: Specify Pronote URL using Geolocation. */
function SpecifyUrlGeolocation ({ state, setState }: SpecifyUrlGeolocationProps) {
  const [geolocationResults, setGeolocationResults] = useState<PronoteApiGeolocationParsedItem[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<PronoteApiGeolocationParsedItem | null>(null);

  /**
   * Returns the school distance in kilometers
   * with the school's latitude and longitude.
   */
  const getSchoolDistance = (
    currentLocation: { latitude: number; longitude: number },
    schoolLocation: { latitude: number; longitude: number }
  ) => {
    const distanceInMeters = haversine({
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude
    }, {
      latitude: schoolLocation.latitude,
      longitude: schoolLocation.longitude
    });

    const distanceInKilometers = distanceInMeters / 1000;
    const fixedDistance = distanceInKilometers.toFixed(1);

    return +fixedDistance;
  };

  // On component mount, use Pronote geolocation.
  useEffect(() => {
    (async () => {
      /**
       * Check if geolocation is supported
       * in the user's navigator.
       */
      if ("geolocation" in navigator) {
        const {
          coords: { longitude, latitude }
        } = await getPosition();

        /** Taken from Pronote APK. */
        const results_sort_function = (
          a: PronoteApiGeolocationParsedItem,
          b: PronoteApiGeolocationParsedItem
        ) =>
          a.distance > b.distance
            ? 1
            : a.distance < b.distance
              ? -1
              : a.name > b.name
                ? 1
                : a.name < b.name
                  ? -1
                  : 0;

        /**
         * Send our geolocation to Pronote
         * to get the nearest schools.
         */
        const data = await sendPronoteGeolocation(latitude, longitude);
        const parsed_data: PronoteApiGeolocationParsedItem[] = data.map(result => ({
          url: result.url,
          name: result.nomEtab,
          distance: getSchoolDistance({
            latitude, longitude
          }, {
            latitude: +result.lat,
            longitude: +result.long
          })
        })).sort(results_sort_function);

        setGeolocationResults(parsed_data);
        setSelectedSchool(parsed_data[0]);
      }
      else {
        alert("La géolocalisation n'est pas disponible dans votre navigateur.");
      }
    })();
  }, []);

  /**
   * Parse the informations from the selected school.
   * Move to next step if the informations are valid.
   */
  const handlePronoteConnect = async () => {
    if (selectedSchool) {
      const [success, data] = await getInformationsFrom(selectedSchool.url);
      if (success) {
        const schoolInformations = data as SchoolInformations;

        setState({
          ...state,
          pronoteUrl: selectedSchool.url,
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
        <h2 className="text-lg font-medium">Géolocalisation</h2>
        <p>Choisissez votre établissement dans la liste ci-dessous</p>
      </div>
      {selectedSchool ? (
        <SelectInput
          value={selectedSchool}
          onChange={setSelectedSchool}
          placeholder={selectedSchool.name}
        >
          {geolocationResults.map((result, id) => (
            <SelectInputOption
              key={id}
              value={result}
              name={`(${result.distance}km) ${result.name}`}
            />
          ))}
        </SelectInput>
      ): (
        <Fragment>
          <p className="font-medium">Chargement...</p>
          <span>N&apos;oubliez pas d&apos;accepter la géolocalisation de votre appareil.</span>
        </Fragment>
      )}

      <Button
        onClick={handlePronoteConnect}
      >
        Valider votre choix d&apos;établissement
      </Button>
    </div>
  );
}

export default SpecifyUrlGeolocation;