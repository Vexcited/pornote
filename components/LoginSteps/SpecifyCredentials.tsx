import type { StateTypes, UpdateStateType } from "pages/login";

import { Fragment } from "react";
  
export default function SpecifyCredentials ({
  state,
  updateState
}: {
    state: StateTypes;
    updateState: UpdateStateType;
}) {

  const handleLogin = async () => {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        pronoteUrl: state.pronoteUrl,
        pronoteAccountId: state.accountType.id,
        pronoteAccountPath: state.accountType.path
      })
    });

    const data = await response.json();
    console.log(data);
  };

  return (
    <Fragment>
      <h4>
        {state.schoolInformations.name}
      </h4>

      <input
        placeholder="Nom d'utilisateur"
        value={state.username}
        onChange={({ target }) => updateState("username", target.value )}
      />
      <input
        placeholder="Mot de passe"
        type="password"
        value={state.password}
        onChange={({ target }) => updateState("password", target.value )}
      />
      <button
        onClick={handleLogin}
      >
                Se connecter !
      </button>
    </Fragment>
  );
}