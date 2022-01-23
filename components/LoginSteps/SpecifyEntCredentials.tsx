import type { StateTypes } from "pages/login";

import React, {
  useState,
  
  // Types
  Dispatch,
  SetStateAction
} from "react";

type SpecifyEntCredentialsProps = {
  state: StateTypes;
  setState: Dispatch<SetStateAction<StateTypes>>;
}

function SpecifyEntCredentials ({ state, setState }: SpecifyEntCredentialsProps) {
  const [formState, setFormState] = useState({
    username: "",
    password: ""
  });

  type FormStateTypes = typeof formState;
  const updateFormStateInput = (key: keyof FormStateTypes) => (evt: React.ChangeEvent<HTMLInputElement>) => setFormState({
    ...formState,
    [key]: evt.target.value
  });

  const handleEntLogin = (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();

    console.log(state);
  }

  return (
    <div>
      <form onSubmit={handleEntLogin}>
        <input 
          type="text"
          placeholder="Nom d'utilisateur"
          onChange={updateFormStateInput("username")}
          value={formState.username}
        />

        <input 
          type="password"
          placeholder="Mot de passe"
          onChange={updateFormStateInput("password")}
          value={formState.password}
        />

        <button type="submit">
          Se connecter !
        </button>
      </form>
    </div>
  )
}

export default SpecifyEntCredentials;