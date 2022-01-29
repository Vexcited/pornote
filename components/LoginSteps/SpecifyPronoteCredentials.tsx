import type { StateTypes } from "pages/login";
import type {
  ApiAuthenticationResponse,
  ApiIdentificationResponse,
  ApiInformationsResponse,
  ApiServerError,
  ApiUserResponse
} from "types/ApiData";

import type {
  PronoteApiFonctionParametresStudent
} from "types/PronoteApiData";

import type {
  SavedAccountData
} from "types/SavedAccountData";

import React, { useState } from "react";

import ky, { HTTPError } from "ky";
import forge from "node-forge";

import { SelectInput, SelectInputOption } from "components/SelectInput";
import InputText from "components/InputText";
import Button from "components/Button";

import decryptAes from "@/apiUtils/decryptAes";
import encryptAes from "@/apiUtils/encryptAes";

import ModalSpecifySlug from "./utils/ModalSpecifySlug";

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

    try {
      const pronoteInformationsData = await ky.post("/api/informations", {
        json: {
          pronoteUrl: state.pronoteUrl,
          pronoteAccountId: selectedAccountType.id,
          pronoteAccountPath: selectedAccountType.path
        }
      }).json<ApiInformationsResponse>();

      if (!pronoteInformationsData.pronoteCryptoInformations) throw Error("Missing fields.");

      // IV used to decrypt AES datas.
      const iv = pronoteInformationsData.pronoteCryptoInformations.iv;
      const bufferIv = forge.util.createBuffer(iv);

      const sessionId = parseInt(pronoteInformationsData.pronoteCryptoInformations.session.h);

      // Check 'numeroOrdre' from 'pronoteInformationsData'.
      // It should be equal to '2'.
      const decryptedInformationsOrder = decryptAes(
        pronoteInformationsData.pronoteData.numeroOrdre,
        { iv: bufferIv }
      );

      const identificationOrderEncrypted = encryptAes(
        (parseInt(decryptedInformationsOrder) + 1).toString(),
        { iv: bufferIv }
      );

      const pronoteIdentificationData = await ky.post("/api/identification", {
        json: {
          pronoteUrl: state.pronoteUrl,
          pronoteAccountId: selectedAccountType.id,
          pronoteSessionId: sessionId,
          pronoteOrder: identificationOrderEncrypted,

          identifier: formState.username
        }
      }).json<ApiIdentificationResponse>();

      // Check 'numeroOrdre' from 'pronoteIdentificationData'.
      // It should be equal to '4'.
      const decryptedIdentificationOrder = decryptAes(
        pronoteIdentificationData.pronoteData.numeroOrdre,
        { iv: bufferIv }
      );

      const authenticationOrderEncrypted = encryptAes(
        (parseInt(decryptedIdentificationOrder) + 1).toString(),
        { iv: bufferIv }
      );

      const challengeData = pronoteIdentificationData.pronoteData.donneesSec.donnees;

      // Update username with `modeCompLog`.
      let pronoteUsername = formState.username;
      if (challengeData.modeCompLog === 1)
        pronoteUsername = pronoteUsername.toLowerCase();

      // Update password with `modeCompMdp`
      let pronotePassword = formState.password;
      if (challengeData.modeCompMdp === 1)
        pronotePassword = pronotePassword.toLowerCase();

      /**
       * Hash for the challenge key is an
       * uppercase HEX representation
       * of a SHA256 hash of "challengeData.alea"
       * and the user password concatenated
       * into a single string.
       */
      const challengeAesKeyHash = forge.md.sha256
        .create()
        .update(challengeData.alea)
        .update(forge.util.encodeUtf8(pronotePassword))
        .digest()
        .toHex()
        .toUpperCase();

      /**
       * Challenge key is an MD5 hash of the username,
       * and the SHA256 hash created of "alea" and user password.
       */
      const challengeAesKey = pronoteUsername + forge.util.encodeUtf8(challengeAesKeyHash);
      const challengeAesKeyBuffer = forge.util.createBuffer(challengeAesKey);

      const decryptedBytes = decryptAes(challengeData.challenge, {
        iv: bufferIv,
        key: challengeAesKeyBuffer
      });

      const decrypted = forge.util.decodeUtf8(decryptedBytes);
      const unscrambled = new Array(decrypted.length);
      for (let i = 0; i < decrypted.length; i += 1) {
        if (i % 2 === 0) {
          unscrambled.push(decrypted.charAt(i));
        }
      }

      const splitedDecrypted = unscrambled.join("");
      const encrypted = encryptAes(splitedDecrypted, {
        iv: bufferIv,
        key: challengeAesKeyBuffer
      });

      const pronoteAuthenticationData = await ky.post("/api/authentication", {
        json: {
          pronoteUrl: state.pronoteUrl,
          pronoteAccountId: selectedAccountType.id,
          pronoteSessionId: sessionId,

          pronoteOrder: authenticationOrderEncrypted,
          pronoteSolvedChallenge: encrypted
        }
      }).json<ApiAuthenticationResponse>();

      const authenticationData = pronoteAuthenticationData.pronoteData.donneesSec.donnees;
      if (!authenticationData.cle) {
        console.error("Incorrect login.");
      }

      const decryptedAuthenticationKey = decryptAes(authenticationData.cle, {
        iv: bufferIv,
        key: challengeAesKeyBuffer
      });

      /** Get the new AES key buffer. */
      const authenticationKeyBytesArray = new Uint8Array(decryptedAuthenticationKey.split(",").map(a => parseInt(a)));
      const authenticationKey = forge.util.createBuffer(authenticationKeyBytesArray);

      // Check 'numeroOrdre' from 'pronoteIdentificationData'.
      // It should be equal to '6'.
      const decryptedAuthenticationOrder = decryptAes(
        pronoteAuthenticationData.pronoteData.numeroOrdre,
        { iv: bufferIv }
      );

      const encryptedUserOrder = encryptAes(
        (parseInt(decryptedAuthenticationOrder) + 1).toString(),
        { iv: bufferIv, key: authenticationKey }
      );

      const pronoteUserData = await ky.post("/api/user", {
        json: {
          pronoteUrl: state.pronoteUrl,
          pronoteAccountId: selectedAccountType.id,
          pronoteSessionId: sessionId,

          pronoteOrder: encryptedUserOrder
        }
      }).json<ApiUserResponse>();

      const pronoteInformationsOnlyData = pronoteInformationsData.pronoteData as (
        | PronoteApiFonctionParametresStudent
      );

      // Saving data to state for usage in 'ModalSpecifySlug'.
      setAuthData({
        currentSessionData: {
          iv,
          key: authenticationKeyBytesArray,
          session: pronoteInformationsData.pronoteCryptoInformations.session
        },
        schoolInformations: pronoteInformationsOnlyData.donneesSec.donnees,
        userInformations: pronoteUserData.pronoteData.donneesSec.donnees
      });
    }
    catch (e) {
      if (e instanceof HTTPError) {
        const body: ApiServerError = await e.response.json();
        console.error(body.message, body.debug);
      }
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
