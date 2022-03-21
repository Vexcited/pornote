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

export type RequestSuccess<T> = {
  success: true;
  data: T;
  usedOrder: [string, number];
  returnedOrder: [string, number];
}

export type RequestFail = {
  success: false;
  message: string;
  usedOrder: [string, number];
  debug?: any;
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
}: RequestProps): Promise<RequestSuccess<T> | RequestFail> {

  // Get the AES encryption IV and key.
  const aesIv = encryption?.aesIv ? forge.util.createBuffer(encryption.aesIv) : undefined;
  const aesKey = encryption?.aesKey ? forge.util.createBuffer(encryption.aesKey) : undefined;

  const orderEncrypted = aesEncrypt(order.toString(), {
    iv: aesIv, key: aesKey
  });

  if (isCompressed) {
    // We get the JSON as string.
    body = forge.util.encodeUtf8("" + JSON.stringify(body));
    // We compress it using zlib, level 6, without headers.
    body = pako.deflateRaw(forge.util.createBuffer(body).toHex(), { level: 6, to: "string" });
    // We output it to HEX.
    // When encrypted, we should get the bytes from this hex.
    // When not encrypted, we send this HEX.
    body = forge.util.bytesToHex(body).toUpperCase();
  }

  if (isEncrypted) {
    const data = isCompressed
      // If the data has been compressed, we get the bytes
      // of the compressed data (from HEX).
      ? forge.util.hexToBytes(body)
      // Otherwise, we get the JSON as string.
      : forge.util.encodeUtf8("" + JSON.stringify(body));

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
      const decrypted = aesDecrypt(receivedData as string, {
        iv: aesIv, key: aesKey
      });

      if (!isCompressed) {
        receivedData = JSON.parse(decrypted);
      } else receivedData = forge.util.bytesToHex(decrypted);
    }

    if (isCompressed) {
      const toDecompress = Buffer.from(receivedData as string, "hex");
      receivedData = pako.inflateRaw(toDecompress, { to: "string" });
    }

    if (typeof receivedData === "string") {
      receivedData = forge.util.decodeUtf8(receivedData);
      receivedData = JSON.parse(receivedData) as T;
    }

    return {
      success: true,
      usedOrder: [orderEncrypted, order],
      returnedOrder: [data.numeroOrdre, parseInt(decryptedOrder)],
      data: receivedData
    };
  }
  catch (e) {
    if (e instanceof HTTPError) {
      const body = e.response.body as PronoteApiError;

      return {
        success: false,
        message: "Erreur serveur Pronote API",
        usedOrder: [orderEncrypted, order],
        debug: { body }
      };
    }

    console.error(e);

    return {
      success: false,
      message: "Erreur inconnue.",
      usedOrder: [orderEncrypted, order],
      debug: { e }
    };
  }
}