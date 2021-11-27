import type { PronoteGeolocationResult } from "types/PronoteData";
import type { StateTypes, UpdateStateType } from "pages/login";

import { useState, useEffect } from "react";

import getPosition from "@/webUtils/getLocation";
import getInformationsFrom from "@/webUtils/getInformationsFrom";
import fixSchoolName from "@/webUtils/fixSchoolName";

import { MdLocationOn } from "react-icons/md";

type SpecifyUrlProps = {
  state: StateTypes;
  updateState: UpdateStateType;
}

export function SpecifyUrl ({
  state,
  updateState
}: SpecifyUrlProps) {
  const [geoResults, setGeoResults] = useState<PronoteGeolocationResult[]>([]);
  const [showManual, setShowManual] = useState(true);

  const handleGeolocation = async () => {
    if ("geolocation" in navigator) {
      const {
        coords: { longitude, latitude }
      } = await getPosition();
 
      const pronoteResponse = await fetch(
        "https://www.index-education.com/swie/geoloc.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
          },
          body: `data=${JSON.stringify({
            nomFonction: "geoLoc", // Geolocation
            lat: latitude.toString(),
            long: longitude.toString()
          })}`
        }
      );
 
      // We get the response.
      // If the data isn't an array (no results),
      // then we create it ourselves (prevent errors).
      const pronoteDataRaw = await pronoteResponse.json();
      const data: PronoteGeolocationResult[] = Array.isArray(pronoteDataRaw) ? pronoteDataRaw : [];

      // Store results !
      setGeoResults(data);
    }
    else {
      alert("La géolocalisation n'est pas disponible dans votre navigateur.");
    }
  };

  /**
   * Function to parse the informations
   * gathered on the home page.
   */
  const handlePronoteConnect = async () => {
    const schoolInformations = await getInformationsFrom(state.pronoteUrl);

    // We save these informations that will trigger the useEffect below.
    updateState("schoolInformations", schoolInformations);
  };

  // TODO: Trigger only after handlePronoteConnect().
  useEffect(() => {
    /** Debug */ console.info("useEffect triggered.");
    const { availableAccountTypes } = state.schoolInformations;

    // We go to the next step if the current state have been updated.
    if (availableAccountTypes.length > 0) {
      // We go to the next step.
      updateState("step", 1);
    }
  }, [state.schoolInformations]);

  return (
    <div className="flex flex-col justify-center items-center w-96 bg-green-200 bg-opacity-60 rounded-md p-8">
      <div className="rounded-md shadow">
        <button
          onClick={handleGeolocation}
          className="inline-flex items-center justify-center px-5 py-3 border border-transparent font-medium rounded-md text-green-100 bg-green-600 hover:bg-green-700"
        >
          <MdLocationOn size={20} />
          Me géolocaliser
        </button>
      </div>


      <form>
        <select
          defaultValue="manual"
          onChange={({ target }) => {
            if (target.value === "manual") {
              setShowManual(true);
            }
            else {
              setShowManual(false);
              updateState("pronoteUrl", target.value);
            }
          }}
        >
          <option value="manual">
              Manuel
          </option>
          {geoResults.map(school =>
            <option
              key={`${school.lat}-${school.long}`}
              value={school.url}
            >
              {fixSchoolName(school.nomEtab)} ({school.cp})
            </option>
          )}
        </select>
      </form>

      {showManual &&
          <input
            className="
              px-2 py-1
              placeholder-gray-400
              text-gray-600
              relative
              bg-white
              rounded
              text-sm
              border border-gray-400
              outline-none
              focus:outline-none focus:ring
              w-full
            "
            placeholder="URL Pronote"
            value={state.pronoteUrl}
            onChange={({ target }) => updateState("pronoteUrl", target.value)}
          />
      }

      {
        state.pronoteUrl.includes("index-education.net/pronote") &&
          <button
            onClick={handlePronoteConnect}
          >
            Se connecter à ce serveur Pronote
          </button>
      }
    </div>
  );
}
