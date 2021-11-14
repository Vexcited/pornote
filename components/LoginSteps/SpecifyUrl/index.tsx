import type { PronoteGeolocationResult } from "types/PronoteData";
import type { StateTypes, UpdateStateType } from "pages/login";

import React, { useState, useEffect } from "react";

import getPosition from "@/webUtils/getLocation";
import getInformationsFrom from "@/webUtils/getInformationsFrom";
import fixSchoolName from "@/webUtils/fixSchoolName";

export function SpecifyUrl ({
  state,
  updateState
}: {
  state: StateTypes;
  updateState: UpdateStateType;
}) {
  const [geoResults, setGeoResults] = useState<PronoteGeolocationResult[]>([]);
  const [showManual, setShowManual] = useState(true);

  const handleGeolocation = async () => {
    if ("geolocation" in navigator) {
      const {
        coords: { longitude, latitude }
      } = await getPosition();
 
      // We try to get a response from Pronote.
      const pronoteResponse = await fetch(
        // URL from the Pronote APK. 
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
      alert ("Geolocation is not supported in your browser.");
    }
  };

  const handlePronoteConnect = async () => {
    // We try to get account types from Pronote.
    const schoolInformations = await getInformationsFrom(state.pronoteUrl);

    // We store the account types.
    // This will trigger the useEffect below.
    updateState("schoolInformations", schoolInformations);
  };

  /**
   * Callback when the account types are changed.
   */
  useEffect(() => {
    // We check if the account types are available.
    if (
      state.schoolInformations.availableAccountTypes.length > 0
      && state.schoolInformations.name !== ""  
    ) {
      // We go to the next step.
      updateState("step", 1);
    }
  }, [state.schoolInformations]);

  return (
    <React.Fragment>
      <figure className="w-64 bg-gray-100 rounded-xl p-8">
        <div className="inline-flex rounded-md shadow">
          <button
            onClick={handleGeolocation}
            className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
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
            className="px-2
            py-1
            placeholder-gray-400
            text-gray-600
            relative
            bg-white bg-white
            rounded
            text-sm
            border border-gray-400
            outline-none
            focus:outline-none focus:ring
            w-full"
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
      </figure>
    </React.Fragment>
  );
}
