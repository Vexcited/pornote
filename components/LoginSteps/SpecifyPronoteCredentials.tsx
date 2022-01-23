import type { StateTypes } from "pages/login";

import React, {
  useState,

  // Types
  Dispatch,
  SetStateAction
} from "react";

import { SelectInput, SelectInputOption } from "components/SelectInput";

type SpecifyPronoteCredentialsProps = {
  state: StateTypes;
  setState: Dispatch<SetStateAction<StateTypes>>;
}

function SpecifyPronoteCredentials ({ state, setState }: SpecifyPronoteCredentialsProps) {
  const [formState, setFormState] = useState({
    username: "",
    password: ""
  });

  const [selectedAccountType, setSelectedAccountType] = useState({
    id: 0,
    name: "",
    path: ""
  });

  type FormStateTypes = typeof formState;
  const updateFormStateInput = (key: keyof FormStateTypes) => (evt: React.ChangeEvent<HTMLInputElement>) => setFormState({
    ...formState,
    [key]: evt.target.value
  });

  const handlePronoteLogin = (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();

    console.log(formState, selectedAccountType);
  };

  return (
    <div>
      <form onSubmit={handlePronoteLogin}>

        <SelectInput
          placeholder="Type de compte"
          value={selectedAccountType}
          onChange={setSelectedAccountType}
        >
          {state.schoolInformations.availableAccountTypes.map(accountType => (
            <SelectInputOption
              key={accountType.id}
              name={accountType.name}
              value={accountType}
            />
          ))}
        </SelectInput>

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
  );
}

export default SpecifyPronoteCredentials;