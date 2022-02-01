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

import loginToPronote from "@/webUtils/fetch/loginToPronote";
import getAccountTypeFromUrl from "@/webUtils/getAccountTypeFromUrl";

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

  // Store the auth data to save them later.
  const [authData, setAuthData] = useState<SavedAccountData | null>(null);

  const handleEntLogin = async (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();

    const entUrl = state.schoolInformations.entUrl;

    try {
      const entCookiesData = await ky.post("/api/getEntCookies", {
        json: {
          entUrl,
          entUsername: formState.username,
          entPassword: formState.password
        }
      }).json<ApiGetEntCookiesResponse>();

      // Pronote URL with 'identifiant=xxxxxxx'.
      const pronoteData = await ky.post("/api/getPronoteTicket", {
        json: {
          entUrl,
          entCookies: entCookiesData.entCookies
        }
      }).json<ApiGetPronoteTicketResponse>();

      const accountType = getAccountTypeFromUrl(pronoteData.pronoteUrl);
      console.log(accountType);

      const loginData = await loginToPronote({
        pronoteUrl: pronoteData.pronoteUrl,
        usingEnt: true,
        cookie: "",
        accountPath: accountType.path,
        accountId: accountType.id
      });

      console.log(loginData);

      // console.info(entCookiesData.entCookies, pronoteCookies.pronoteCookies);
    }
    catch (e) {
      if (e instanceof HTTPError) {
        const body = await e.response.json() as ApiServerError;
        return console.error(body.message);
      }

      console.error(e);
    }
  };

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
          placeholder="Nom d'utilisateur"
        />

        <InputText
          type="password"
          id="entUsername"
          onChange={updateFormStateInput("password")}
          value={formState.password}
          placeholder="Mot de passe"
        />

        <Button
          buttonType="submit"
          isButton={true}
        >
          Se connecter à l&apos;ENT
        </Button>
      </form>
    </div>
  );
}

export default SpecifyEntCredentials;