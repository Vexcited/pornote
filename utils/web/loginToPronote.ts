import type {
  ApiAuthenticationResponse,
  ApiGetPronoteTicketResponse,
  ApiIdentificationResponse,
  ApiInformationsResponse,
  ApiServerError,
  ApiUserResponse
} from "types/ApiData";

import type { ApiInformationsRequestBody } from "pages/api/informations";
import type {  } from "pages/api/identification";

import type {
  PronoteApiFonctionParametresStudent
} from "types/PronoteApiData";

import type {
  SavedAccountData
} from "types/SavedAccountData";

import ky, { HTTPError } from "ky";
import forge from "node-forge";

import accountTypes from "@/apiUtils/accountTypes";

type LoginToPronoteProps = {
  username?: string;
  password?: string;

  /** Pronote URL to login to when not using ENT. */
  pronoteUrl?: string;

  /** ENT URL to login to when using ENT. */
  entUrl?: string;
  usingEnt?: boolean;
  entCookies?: string[];
  cookie?: string;
};

// Utility used to create the next string order.
const getNextOrderNumber = (current: string) => (parseInt(current) + 1).toString();

export default async function loginToPronote ({
  username,
  password,
  pronoteUrl,
  usingEnt = false,
  entUrl,
  entCookies,
  cookie
}: LoginToPronoteProps): Promise<(null | SavedAccountData)> {
  try {
    if (usingEnt) {
      // Pronote URL with 'identifiant=xxxxxxx'.
      const pronoteData = await ky.post("/api/getPronoteTicket", {
        json: {
          entUrl,
          entCookies
        }
      }).json<ApiGetPronoteTicketResponse>();

      pronoteUrl = pronoteData.pronoteUrl;
    } else if (!pronoteUrl) return null;

    const pronoteUrlObject = new URL(pronoteUrl);
    const pronoteUrlAccountPath = pronoteUrlObject.pathname.split("/").pop();
    console.log(pronoteUrlAccountPath);

    const accountType = accountTypes.find(a => a.path === pronoteUrlAccountPath);
    if (!accountType) return null;

    let pronoteUsername = username || "";
    let pronotePassword = password || "";

    const pronoteInformationsBody: ApiInformationsRequestBody = {
      pronoteAccountId: accountType.id,
      pronoteUrl,
      // Relogin to Pronote using ENT cookie.
      ...(usingEnt ? {
        pronoteAccountCookie: cookie || undefined,
        useRawUrl: true
      } :
      // When passed a cookie but not using ENT, we just relogin to Pronote.
        // When re-login to Pronote, we should re-use the exact same URL
        // that we used to first time.
        cookie ? {
          pronoteAccountCookie: cookie,
          useRawUrl: false
        }
        // We just login to Pronote for the first time.
          : { useRawUrl: false })
    };

    const pronoteInformationsData = await ky.post("/api/informations", {
      json: pronoteInformationsBody
    }).json<ApiInformationsResponse>();

    // Check if fields are missing in response.
    if (!pronoteInformationsData.pronoteCryptoInformations) {
      console.error("Missing crypto informations in response.", pronoteInformationsData);
      return null;
    }

    const pronoteLoginCookies = [cookie, pronoteInformationsData.pronoteHtmlCookie];

    // IV used to decrypt AES datas.
    const iv = pronoteInformationsData.pronoteCryptoInformations.iv;
    const bufferIv = forge.util.createBuffer(iv);

    // Parse current session ID.
    const currentSession = pronoteInformationsData.pronoteCryptoInformations.session;
    const sessionId = parseInt(currentSession.h);

    // When using a cookie from Pronote or ENT, identifiers are given.
    // `e` is the username, `f` is the password.
    if (currentSession.e && currentSession.f) {
      pronoteUsername = currentSession.e;
      pronotePassword = currentSession.f;
    }
    const isUsingPronoteIdentifiers = !! (currentSession.e && currentSession.f);
    console.info("[loginToPronote]: `isUsingPronoteIdentifiers`:", isUsingPronoteIdentifiers);

    const pronoteIdentificationBody = {

    };

    const pronoteIdentificationData = await ky.post("/api/identification", {
      json: {
        pronoteUrl,
        pronoteAccountId: accountType.id,
        pronoteSessionId: sessionId,
        pronoteOrder: identificationOrderEncrypted,

        identifier: pronoteUsername,
        ...(isUsingPronoteIdentifiers ? { pronoteCookies: pronoteLoginCookies } : {}),
        usingEnt
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
    if (challengeData.modeCompLog === 1)
      pronoteUsername = pronoteUsername.toLowerCase();

    // Update password with `modeCompMdp`
    if (challengeData.modeCompMdp === 1)
      pronotePassword = pronotePassword.toLowerCase();

    /**
     * Hash for the challenge key is an
     * uppercase HEX representation
     * of a SHA256 hash of "challengeData.alea"
     * and the user password concatenated
     * into a single string.
     */
    const challengeAesKeyHashCreation = forge.md.sha256.create();
    let challengeAesKeyHashUpdate: forge.md.MessageDigest;

    // If we use a Pronote cookie (ENT or simple re-login), we don't use `alea`.
    challengeAesKeyHashUpdate = !isUsingPronoteIdentifiers
      ? challengeAesKeyHashCreation.update(challengeData.alea)
      : challengeAesKeyHashCreation;

    // Continue hashing...
    const challengeAesKeyHash = challengeAesKeyHashUpdate
      .update(forge.util.encodeUtf8(pronotePassword))
      .digest()
      .toHex()
      .toUpperCase();

    /**
     * Challenge key is an MD5 hash of the username,
     * and the SHA256 hash created of "alea" and user password.
     */
    const challengeAesKeyHashUtf8 = forge.util.encodeUtf8(challengeAesKeyHash);
    const challengeAesKey = !isUsingPronoteIdentifiers
      ? pronoteUsername + challengeAesKeyHashUtf8
      : challengeAesKeyHashUtf8;
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
        pronoteAccountId: accountType.id,
        pronoteSessionId: sessionId,

        pronoteOrder: authenticationOrderEncrypted,
        pronoteSolvedChallenge: encrypted,
        ...(isUsingPronoteIdentifiers ? { pronoteCookies: pronoteLoginCookies } : {})
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
        pronoteAccountId: accountType.id,
        pronoteSessionId: sessionId,

        pronoteOrder: encryptedUserDataOrder,
        ...(cookie ? { pronoteCookie: cookie } : {}),
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
        loginCookie: cookie ? cookie : pronoteUserData.pronoteLoginCookie,
        usingEnt,
        pronoteUrl,
        entCookies,
        entUrl
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
    else {
      console.error(e);
    }

    return null;
  }
}