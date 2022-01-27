import type { StateTypes } from "pages/login";
import type {
  ApiAuthenticationResponse,
  ApiIdentificationResponse,
  ApiInformationsResponse,
  ApiServerError
} from "types/ApiData";

import React, {
  useState,

  // Types
  Dispatch,
  SetStateAction
} from "react";

import ky, { HTTPError } from "ky";
import forge from "node-forge";

import { SelectInput, SelectInputOption } from "components/SelectInput";

import decryptOrder from "@/apiUtils/decryptOrder";
import generateOrder from "@/apiUtils/generateOrder";
import md5 from "@/apiUtils/createMd5Buffer";

type SpecifyPronoteCredentialsProps = {
  state: StateTypes;
  setState: Dispatch<SetStateAction<StateTypes>>;
}

function SpecifyPronoteCredentials ({ state, setState }: SpecifyPronoteCredentialsProps) {
  const [formState, setFormState] = useState({
    username: "",
    password: ""
  });

  const [selectedAccountType, setSelectedAccountType] = useState(state.schoolInformations.availableAccountTypes[0]);

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
      const decryptedInformationsOrder = decryptOrder(
        pronoteInformationsData.pronoteData.numeroOrdre,
        { iv: bufferIv }
      );

      const identificationOrderEncrypted = generateOrder(
        parseInt(decryptedInformationsOrder) + 1,
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
      const decryptedIdentificationOrder = decryptOrder(
        pronoteIdentificationData.pronoteData.numeroOrdre,
        { iv: bufferIv }
      );

      const authenticationOrderEncrypted = generateOrder(
        parseInt(decryptedIdentificationOrder) + 1,
        { iv: bufferIv }
      );

      const challengeData = pronoteIdentificationData.pronoteData.donneesSec.donnees;

      /**
       * Hash for the challenge key is an
       * uppercase HEX representation
       * of a SHA256 hash of "challengeData.alea"
       * and the user password concatenated
       * into a single string.
       */
      const challengeAesKeyHash = forge.md.sha256
        .create()
        .update(challengeData.alea || "")
        .update(
          forge.util.encodeUtf8(formState.password)
        )
        .digest()
        .toHex()
        .toUpperCase();

      /**
       * Challenge key is an MD5 hash of the username,
       * and the SHA256 hash created of "alea" and user password.
       */
      const challengeAesKey = formState.username.toLowerCase() + challengeAesKeyHash;
      const challengeAesKeyBuffer = forge.util.createBuffer(forge.util.encodeUtf8(challengeAesKey));

      // const challengeAesDecipher = forge.cipher.createDecipher("AES-CBC", md5(challengeAesKeyBuffer));
      // challengeAesDecipher.start({ iv: md5(bufferIv) });
      // challengeAesDecipher.update(forge.util.createBuffer(challengeData.challenge));
      // challengeAesDecipher.finish();

      // const decrypted = challengeAesDecipher.output.bytes();
      const decrypted = decryptOrder(challengeData.challenge, {
        iv: bufferIv,
        key: challengeAesKeyBuffer
      });

      const splitedDecrypted = decrypted.split("").filter((_, i) => (i + 1) % 2 !== 0).join("");
      console.log(splitedDecrypted);

      // const challengeAesCipher = forge.cipher.createCipher("AES-CBC", md5(challengeAesKeyBuffer));
      // challengeAesCipher.start({ iv: md5(bufferIv) });
      // challengeAesCipher.update(forge.util.createBuffer(splitedDecrypted));
      // challengeAesCipher.finish();

      const encrypted = generateOrder(splitedDecrypted, {
        iv: bufferIv,
        key: challengeAesKeyBuffer
      });

      console.log(encrypted);

      const pronoteAuthenticationData = await ky.post("/api/authentication", {
        json: {
          pronoteUrl: state.pronoteUrl,
          pronoteAccountId: selectedAccountType.id,
          pronoteSessionId: sessionId,

          pronoteOrder: authenticationOrderEncrypted,
          pronoteSolvedChallenge: encrypted
        }
      }).json<ApiAuthenticationResponse>();

      console.log(pronoteAuthenticationData.pronoteData.donneesSec.donnees);
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
