import type { StateTypes } from "pages/login";
import type {
  ApiLoginResponse,
  ApiServerError
} from "types/ApiData";

import React, {
  useState,

  // Types
  Dispatch,
  SetStateAction
} from "react";

import ky, { HTTPError } from "ky";

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

  const handlePronoteLogin = async (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();

    try {
      const data = await ky.post("/api/loginPronote", {
        json: {
          pronoteUrl: state.pronoteUrl,
          pronoteAccountId: selectedAccountType.id,
          pronoteAccountPath: selectedAccountType.path
        }
      }).json<ApiLoginResponse>();

      console.info(formState, selectedAccountType, data);
    }
    catch (e) {
      if (e instanceof HTTPError) {
        const body: ApiServerError = await e.response.json();
        console.error(body.message, body.debug);
      }
    }
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