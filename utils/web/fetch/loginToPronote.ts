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

import ky, { HTTPError } from "ky";
import forge from "node-forge";

import decryptAes from "@/apiUtils/decryptAes";
import encryptAes from "@/apiUtils/encryptAes";

type LoginToPronoteProps = {
  username: string;
  password: string;

  accountId: number;

  pronoteUrl: string;
  accountPath: string;
};

// Utility used to create the next string order.
const getNextOrderNumber = (current: string) => (parseInt(current) + 1).toString();

export default async function loginToPronote ({
  username,
  password,
  accountId,
  pronoteUrl,
  accountPath
}: LoginToPronoteProps) {
  try {
    const pronoteInformationsData = await ky.post("/api/informations", {
      json: {
        pronoteUrl,
        pronoteAccountId: accountId,
        pronoteAccountPath: accountPath
      }
    }).json<ApiInformationsResponse>();

    // Check if fields are missing in response.
    if (!pronoteInformationsData.pronoteCryptoInformations) {
      console.error("Missing crypto informations in response.", pronoteInformationsData);
      return null;
    }

    // IV used to decrypt AES datas.
    const iv = pronoteInformationsData.pronoteCryptoInformations.iv;
    const bufferIv = forge.util.createBuffer(iv);

    // Parse current session ID.
    const sessionId = parseInt(pronoteInformationsData.pronoteCryptoInformations.session.h);

    // Check 'numeroOrdre' from 'pronoteInformationsData'.
    // It should be equal to '2'.
    const decryptedInformationsOrder = decryptAes(
      pronoteInformationsData.pronoteData.numeroOrdre,
      { iv: bufferIv }
    );

    const identificationOrderEncrypted = encryptAes(
      getNextOrderNumber(decryptedInformationsOrder),
      { iv: bufferIv }
    );

    const pronoteIdentificationData = await ky.post("/api/identification", {
      json: {
        pronoteUrl,
        pronoteAccountId: accountId,
        pronoteSessionId: sessionId,
        pronoteOrder: identificationOrderEncrypted,

        identifier: username
      }
    }).json<ApiIdentificationResponse>();

    // Check 'numeroOrdre' from 'pronoteIdentificationData'.
    // It should be equal to '4'.
    const decryptedIdentificationOrder = decryptAes(
      pronoteIdentificationData.pronoteData.numeroOrdre,
      { iv: bufferIv }
    );

    const authenticationOrderEncrypted = encryptAes(
      getNextOrderNumber(decryptedIdentificationOrder),
      { iv: bufferIv }
    );

    const challengeData = pronoteIdentificationData.pronoteData.donneesSec.donnees;

    // Update username with `modeCompLog`.
    let pronoteUsername = username;
    if (challengeData.modeCompLog === 1)
      pronoteUsername = pronoteUsername.toLowerCase();

    // Update password with `modeCompMdp`
    let pronotePassword = password;
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

    const splittedDecrypted = unscrambled.join("");
    const encrypted = encryptAes(splittedDecrypted, {
      iv: bufferIv,
      key: challengeAesKeyBuffer
    });

    const pronoteAuthenticationData = await ky.post("/api/authentication", {
      json: {
        pronoteUrl,
        pronoteAccountId: accountId,
        pronoteSessionId: sessionId,

        pronoteOrder: authenticationOrderEncrypted,
        pronoteSolvedChallenge: encrypted
      }
    }).json<ApiAuthenticationResponse>();

    const authenticationData = pronoteAuthenticationData.pronoteData.donneesSec.donnees;
    if (!authenticationData.cle) {
      console.error("Incorrect login.");
      return null;
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

    const encryptedUserDataOrder = encryptAes(
      getNextOrderNumber(decryptedAuthenticationOrder),
      { iv: bufferIv, key: authenticationKey }
    );

    const pronoteUserData = await ky.post("/api/user", {
      json: {
        pronoteUrl,
        pronoteAccountId: accountId,
        pronoteSessionId: sessionId,

        pronoteOrder: encryptedUserDataOrder
      }
    }).json<ApiUserResponse>();

    const pronoteInformationsOnlyData = pronoteInformationsData.pronoteData as (
      | PronoteApiFonctionParametresStudent
    );

    return {
      currentSessionData: {
        iv,
        key: authenticationKeyBytesArray,
        session: pronoteInformationsData.pronoteCryptoInformations.session,
        loginCookie: pronoteUserData.pronoteLoginCookie
      },
      schoolInformations: pronoteInformationsOnlyData.donneesSec.donnees,
      userInformations: pronoteUserData.pronoteData.donneesSec.donnees
    };
  }
  catch (e) {
    if (e instanceof HTTPError) {
      const body: ApiServerError = await e.response.json();
      console.error(body.message, body.debug);
    }

    return null;
  }
}