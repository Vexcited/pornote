import type { StateTypes, UpdateStateType } from "pages/login";

import React, { useEffect } from "react";
export function SpecifyAccountType ({
  state,
  updateState
}: {
    state: StateTypes;
    updateState: UpdateStateType;
}) {
  const updateSelectedAccountType = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = parseInt(event.target.value);

    const accountTypeObject = state.schoolInformations.availableAccountTypes.find(
      (accountType) => accountType.id === value
    );

    if (accountTypeObject) {
      updateState("accountType", accountTypeObject);
    }
  };

  // Default account type state when the component mounts.
  useEffect(() => {
    if (state.accountType.id === 0) {
      updateState("accountType", state.schoolInformations.availableAccountTypes[0]);
    }
  }, []);

  return (
    <React.Fragment>
      <h5>
                Connexion au serveur Pronote {state.schoolInformations.name}
      </h5>

      <form>
        <select
          onChange={updateSelectedAccountType}
          defaultValue={state.schoolInformations.availableAccountTypes[0].id}
        >
          {state.schoolInformations.availableAccountTypes.map((accountType) => (
            <option
              key={accountType.id}
              value={accountType.id}
            >
              {accountType.name}
            </option>
          ))}
        </select>
      </form>

      <button
        onClick={() => updateState("step", 2)}
      >
                Sélectionner
      </button>
    </React.Fragment>
  );
};