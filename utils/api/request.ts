import type {
  PronoteApiResponse,
  PronoteApiError
} from "types/PronoteApiData";

import forge from "node-forge";
import pako from "pako";
import got, { HTTPError } from "got";

import {
  aesDecrypt,
  aesEncrypt
} from "@/apiUtils/encryption";

/**
 * Extend `got` object so we don't have to rewrite
 * the whole `User-Agent` header every time.
 */
export const api = got.extend({
  /**
     * `User-Agent` to send with every request.
     * If you don't request with the same `User-Agent` on every
     * Pronote request, it will fail and log you out.
     */
  headers: {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.99 Safari/537.36"
  }
});

type RequestProps = {
  /** Name of the function used in API. */
  name: string;
  /** Session ID of the user. */
  sessionId: number;
  /** Non-encrypted order. */
  order: number;

  /** Any URL for Pronote. */
  pronoteUrl: string;

  /**
   * Content of `donneesSec` in the request.
   *
   * This will be encrypted and/or compressed depending
   * on `isEncrypted` and `isCompressed` properties.
   */
  body: any;
  encryption?: {
    aesKey: Uint8Array;
    aesIv: string;
  }

  /** Extra cookie when requesting Pronote API. */
  cookie?: string;
  /** ID of the type of user. */
  accountId?: number;

  /** Whether the data is encrypted or not. */
  isEncrypted?: boolean;
  /** Whether the data is compressed or not. */
  isCompressed?: boolean;
}

export async function request<T> ({
  name,
  sessionId,
  order,
  pronoteUrl,
  body,
  cookie,
  isEncrypted = false,
  isCompressed = false,
  accountId = 0,
  encryption
}: RequestProps) {

  // Get the AES encryption IV and key.
  const aesIv = encryption?.aesIv ? forge.util.createBuffer(encryption.aesIv) : undefined;
  const aesKey = encryption?.aesKey ? forge.util.createBuffer(encryption.aesKey) : undefined;

  const orderEncrypted = aesEncrypt(order.toString(), {
    iv: aesIv, key: aesKey
  });

  if (isCompressed) {
    body = JSON.stringify(body);
    body = forge.util.encodeUtf8("" + body);

    body = pako.deflateRaw(forge.util.createBuffer(body).toHex(), { level: 6, to: "string" });

    if (!isEncrypted) {
      // convert the output to hex
      body = forge.util.bytesToHex(body);
    }
  }

  if (isEncrypted) {
    const data = isCompressed ? body : JSON.stringify(body);

    const encrypted_data = aesEncrypt(data, {
      iv: aesIv, key: aesKey
    });

    // Replace the request body with the encrypted one.
    body = encrypted_data;
  }

  const url = `appelfonction/${accountId}/${sessionId}/${orderEncrypted}`;

  try {
    const data = await api.post(url, {
      prefixUrl: pronoteUrl,
      json: {
        session: sessionId,
        numeroOrdre: orderEncrypted,
        nom: name,
        donneesSec: body
      },
      headers: {
        "Cookie": cookie
      }
    }).json<PronoteApiResponse<T | string>>();

    let receivedData = data.donneesSec;
    const decryptedOrder = aesDecrypt(data.numeroOrdre, {
      iv: aesIv, key: aesKey
    });

    if (isEncrypted) {
      receivedData = aesDecrypt(receivedData as string, {
        iv: aesIv, key: aesKey
      });
    }

    if (isCompressed) {
      receivedData = pako.inflateRaw(receivedData as string, { to: "string" });
      receivedData = forge.util.decodeUtf8(receivedData);
    }

    return {
      usedOrder: [orderEncrypted, order],
      returnedOrder: [data.numeroOrdre, decryptedOrder],
      data: data.donneesSec
    };
  }
  catch (e) {
    if (e instanceof HTTPError) {
      const data = e.response.body as PronoteApiError;

      return {
        message: "Erreur serveur Pronote API",
        status: e.response.statusCode,
        usedOrder: [orderEncrypted, order],
        data
      };
    }

    return {
      message: "Erreur inconnue",
      usedOrder: [orderEncrypted, order],
      status: -1,
      data: null
    };
  }
}