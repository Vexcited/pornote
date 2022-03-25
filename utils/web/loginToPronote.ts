import type {
  ApiAuthenticationResponse,
  ApiGetPronoteTicketResponse,
  ApiIdentificationResponse,
  ApiInformationsResponse,
  ApiServerError,
  ApiUserResponse
} from "types/ApiData";

import type { ApiInformationsRequestBody } from "pages/api/informations";
import type { ApiIdentificationRequestBody } from "pages/api/identification";
import type { ApiAuthenticationRequestBody } from "pages/api/authentication";
import type { ApiUserRequestBody } from "pages/api/user";

import type {
  SavedAccountData
} from "types/SavedAccountData";

import ky, { HTTPError } from "ky";
import forge from "node-forge";

import {
  aesEncrypt,
  aesDecrypt
} from "@/apiUtils/encryption";

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
    /** Only for debug purposes. */
    console.group("[loginToPronote] Connecting to Pronote.");

    console.info("Using ENT:", usingEnt);
    if (usingEnt) {
      const ticket_request_body = {
        entUrl,
        entCookies
      };

      // Pronote URL with 'identifiant=xxxxxxx'.
      console.info("[ENT] Sending `/api/getPronoteTicket` request, with body:", ticket_request_body);
      const ticket_response_data = await ky.post("/api/getPronoteTicket", {
        json: ticket_request_body
      }).json<ApiGetPronoteTicketResponse>();

      console.info("[ENT] Got response:", ticket_response_data);
      pronoteUrl = ticket_response_data.pronote_url;
    } else if (!pronoteUrl) return null;

    const pronoteUrlObject = new URL(pronoteUrl);
    const pronoteUrlAccountPath = pronoteUrlObject.pathname.split("/").pop();
    console.info("[Pronote URL] Guessed account_type_path:", pronoteUrlAccountPath);

    // Get account_type from guessed path.
    const accountType = accountTypes.find(a => a.path === pronoteUrlAccountPath);
    if (accountType) console.info("[Pronote URL] account_type:", accountType);
    else return null;

    let pronoteUsername = username || "";
    let pronotePassword = password || "";

    const pronoteInformationsBody: ApiInformationsRequestBody = {
      pronote_account_type_id: accountType.id,
      pronote_url: pronoteUrl,
      // Relogin to Pronote using ENT cookie.
      ...(usingEnt ? {
        pronote_setup_account_cookie: cookie || undefined,
        use_raw_pronote_url: true
      } :
        // When passed a cookie but not using ENT, we just re-login to Pronote.
        // When re-login to Pronote, we should re-use the exact same URL
        // that we used the first time.
        cookie ? {
          pronote_setup_account_cookie: cookie,
          use_raw_pronote_url: false
        }
        // We just login to Pronote for the first time.
          : { use_raw_pronote_url: false })
    };

    const pronoteInformationsData = await ky.post("/api/informations", {
      json: pronoteInformationsBody
    }).json<ApiInformationsResponse>();

    // Check if fields are missing in response.
    if (!pronoteInformationsData.pronoteCryptoInformations) {
      console.error("Missing crypto informations in response.", pronoteInformationsData);
      return null;
    }

    const pronoteLoginCookies = [
      cookie,
      pronoteInformationsData.pronote_setup_account_cookie_response_cookies
    ];

    // IV used for AES encryption.
    const iv = pronoteInformationsData.pronoteCryptoInformations.iv;

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
    console.info("[loginToPronote] `isUsingPronoteIdentifiers`:", isUsingPronoteIdentifiers);

    const pronoteIdentificationBody: ApiIdentificationRequestBody = {
      pronote_url: pronoteUrl,
      session_encryption_iv: iv,
      pronote_account_type_id: accountType.id,
      pronote_session_id: sessionId,
      pronote_session_order: pronoteInformationsData.request.returnedOrder.unencrypted,
      pronote_username: pronoteUsername,
      using_ent: usingEnt,
      pronote_setup_account_cookie_response_cookies: isUsingPronoteIdentifiers
        ? pronoteLoginCookies.join("; ")
        : undefined
    };

    console.info("[Identification] Request body:", pronoteIdentificationBody);
    const pronoteIdentificationData = await ky.post("/api/identification", {
      json: pronoteIdentificationBody
    }).json<ApiIdentificationResponse>();

    const challengeData = pronoteIdentificationData.request.data.donnees;

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

    const decryptedBytes = aesDecrypt(challengeData.challenge, {
      iv: forge.util.createBuffer(iv),
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
    const encrypted = aesEncrypt(splittedDecrypted, {
      iv: forge.util.createBuffer(iv),
      key: challengeAesKeyBuffer
    });

    const pronoteAuthenticationBody: ApiAuthenticationRequestBody = {
      pronote_url: pronoteUrl,
      session_encryption_iv: iv,
      pronote_account_type_id: accountType.id,
      pronote_session_id: sessionId,
      pronote_session_order: pronoteIdentificationData.request.returnedOrder.unencrypted,
      pronote_auth_solved_challenge: encrypted,
      pronote_setup_account_cookie_response_cookies: isUsingPronoteIdentifiers
        ? pronoteLoginCookies.join("; ")
        : undefined
    };

    console.info("[Authentification] Request body:", pronoteAuthenticationBody);
    const pronoteAuthenticationData = await ky.post("/api/authentication", {
      json: pronoteAuthenticationBody
    }).json<ApiAuthenticationResponse>();

    const authenticationData = pronoteAuthenticationData.request.data.donnees;
    if (!authenticationData.cle) {
      console.error("[Auth->Cle][NotFound]: Incorrect login.");
      return null;
    }

    const decryptedAuthenticationKey = aesDecrypt(authenticationData.cle, {
      iv: forge.util.createBuffer(iv),
      key: challengeAesKeyBuffer
    });

    /** Get the new AES key that will be used in our requests. */
    const authenticationKeyBytesArray = new Uint8Array(decryptedAuthenticationKey.split(",").map(a => parseInt(a)));
    const authenticationKey = forge.util.createBuffer(authenticationKeyBytesArray).bytes();

    const pronoteUserBody: ApiUserRequestBody = {
      pronote_url: pronoteUrl,
      session_encryption_iv: iv,
      pronote_account_type_id: accountType.id,
      pronote_session_id: sessionId,
      pronote_session_order: pronoteAuthenticationData.request.returnedOrder.unencrypted,
      pronote_cookie: cookie,
      session_encryption_key: authenticationKey,
    };

    console.info("[User] Request body:", pronoteUserBody);
    const pronoteUserData = await ky.post("/api/user", {
      json: pronoteUserBody
    }).json<ApiUserResponse>();

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
      schoolInformations: pronoteInformationsData.request.data.donnees,
      userInformations: pronoteUserData.request.data.donnees
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