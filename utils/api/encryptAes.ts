import forge from "node-forge";
import md5 from "@/apiUtils/createMd5Buffer";

type GenerateOrderOptions = {
  key?: forge.util.ByteStringBuffer,
  iv?: forge.util.ByteStringBuffer
};

export default function encryptAes (data: string, {
  key = forge.util.createBuffer(),
  iv
}: GenerateOrderOptions) {
  // Create cipher using 'AES-CBC' method and
  // use an MD5 ButeBuffer of the given 'key'.
  const cipher = forge.cipher.createCipher("AES-CBC", md5(key));

  // IV => Generate a MD5 ByteBuffer from current IV.
  if (iv && iv.length()) iv = md5(iv);
  // No IV => Create an empty buffer of 16 bytes.
  else iv = forge.util.createBuffer().fillWithByte(0, 16);

  // We need to encrypt `data` (UTF-8).
  const bufferToEncrypt = forge.util.createBuffer(data, "utf8");
  
  // Start the encryption.
  cipher.start({ iv });
  cipher.update(bufferToEncrypt);

  // Return the encrypted buffer in HEX.
  return cipher.finish() && cipher.output.toHex();
}
