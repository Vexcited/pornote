import type { StateTypes } from "pages/login";

import type {
  ApiGetEntCookiesResponse,
  ApiGetPronoteTicketResponse,
  ApiServerError
} from "types/ApiData";

import type {
  SavedAccountData
} from "types/SavedAccountData";

import React, {
  useState,

  // Types
  Dispatch,
  SetStateAction
} from "react";

import InputText from "components/InputText";
import Button from "components/Button";
import ky, { HTTPError } from "ky";

import loginToPronote from "@/webUtils/loginToPronote";
import ModalSpecifySlug from "./utils/ModalSpecifySlug";

type SpecifyEntCredentialsProps = {
  state: StateTypes;
  setState: Dispatch<SetStateAction<StateTypes>>;
}

function SpecifyEntCredentials ({ state, setState }: SpecifyEntCredentialsProps) {
  const [buttonCurrentText, setButtonCurrentText] = useState("Se connecter à Pronote");
  const [formState, setFormState] = useState({
    username: "",
    password: ""
  });

  type FormStateTypes = typeof formState;
  const updateFormStateInput = (key: keyof FormStateTypes) => (evt: React.ChangeEvent<HTMLInputElement>) => setFormState({
    ...formState,
    [key]: evt.target.value
  });

  // Store the auth data to save them later.
  const [authData, setAuthData] = useState<SavedAccountData | null>(null);

  const handleEntLogin = async (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();

    const initialButtonText = buttonCurrentText;
    const entUrl = state.schoolInformations.entUrl;

    try {
      setButtonCurrentText("Connexion à l'ENT...");
      const entCookiesData = await ky.post("/api/getEntCookies", {
        json: {
          entUrl,
          entUsername: formState.username,
          entPassword: formState.password
        }
      }).json<ApiGetEntCookiesResponse>();

      setButtonCurrentText("Connexion à Pronote...");
      const loginData = await loginToPronote({
        entCookies: entCookiesData.entCookies,
        usingEnt: true,
        entUrl
      });

      if (loginData) {
        setButtonCurrentText("Connexion réussie !");
        setAuthData(loginData);
      }
      else {
        setButtonCurrentText(initialButtonText);
      }
    }
    catch (e) {
      if (e instanceof HTTPError) {
        const body = await e.response.json() as ApiServerError;
        return console.error(body.message);
      }

      console.error(e);
    }
  };

  if (authData) return <ModalSpecifySlug
    authData={authData}
  />;

  return (
    <div>
      <form
        className="
          flex flex-col gap-6
        "
        onSubmit={handleEntLogin}
      >
        <InputText
          id="entUsername"
          onChange={updateFormStateInput("username")}
          value={formState.username}
          label="Nom d'utilisateur (ENT)"
          placeholder="nom.utilisateur"
        />

        <InputText
          type="password"
          id="entPassword"
          onChange={updateFormStateInput("password")}
          value={formState.password}
          label="Mot de passe (ENT)"
          placeholder="(caché)"
        />

        <Button
          buttonType="submit"
          isButton={true}
        >
          {buttonCurrentText}
        </Button>
      </form>
    </div>
  );
}

export default SpecifyEntCredentials;