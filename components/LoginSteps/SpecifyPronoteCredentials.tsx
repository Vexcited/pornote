import type { StateTypes } from "pages/login";

import type {
  SavedAccountData
} from "types/SavedAccountData";

import React, { useState } from "react";

import { SelectInput, SelectInputOption } from "components/SelectInput";
import InputText from "components/InputText";
import Button from "components/Button";
import ModalSpecifySlug from "./utils/ModalSpecifySlug";

import loginToPronote from "@/webUtils/fetch/loginToPronote";

type SpecifyPronoteCredentialsProps = {
  state: StateTypes;
}

function SpecifyPronoteCredentials ({ state }: SpecifyPronoteCredentialsProps) {
  const [formState, setFormState] = useState({
    username: "",
    password: ""
  });

  const [selectedAccountType, setSelectedAccountType] = useState(state.schoolInformations.availableAccountTypes[0]);
  const [authData, setAuthData] = useState<null | SavedAccountData>(null);

  type FormStateTypes = typeof formState;
  const updateFormStateInput = (key: keyof FormStateTypes) => (evt: React.ChangeEvent<HTMLInputElement>) => setFormState({
    ...formState,
    [key]: evt.target.value
  });

  const handlePronoteLogin = async (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();

    const accountData = await loginToPronote({
      username: formState.username,
      password: formState.password,
      accountId: selectedAccountType.id,
      accountPath: selectedAccountType.path,
      pronoteUrl: state.pronoteUrl
    });

    if (accountData) {
      setAuthData(accountData);
    }
  };

  if (authData) return <ModalSpecifySlug
    authData={authData}
  />;

  return (
    <div>
      <form
        className="flex flex-colmun flex-wrap gap-6"
        onSubmit={handlePronoteLogin}
      >

        <SelectInput
          placeholder={selectedAccountType.name}
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

        <InputText
          type="text"
          id="pronoteUsername"

          labelColor="text-brand-light"
          inputClass="w-full border-gray-100 bg-transparent border-2 border-gray-100 text-gray-100 text-opacity-80 focus:bg-green-600 focus:bg-opacity-20 transition-colors"

          placeholder="Nom d'utilisateur"
          onChange={updateFormStateInput("username")}
          value={formState.username}
        />

        <InputText
          type="password"
          id="pronotePassword"

          labelColor="text-brand-light"
          inputClass="w-full border-gray-100 bg-transparent border-2 border-gray-100 text-gray-100 text-opacity-80 focus:bg-green-600 focus:bg-opacity-20 transition-colors"

          placeholder="Mot de passe"
          onChange={updateFormStateInput("password")}
          value={formState.password}
        />

        <Button
          buttonType="submit"
          className="text-brand-dark bg-brand-light"
        >
          Se connecter !
        </Button>
      </form>
    </div>
  );
}

export default SpecifyPronoteCredentials;
