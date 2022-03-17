import forge from "node-forge";

type AesEncryptionOptions = {
  key?: forge.util.ByteStringBuffer,
  iv?: forge.util.ByteStringBuffer
};

/**
 * Generates a MD5 ByteBuffer from another ByteBuffer.
 * @param buffer - ByteBuffer to convert to MD5.
 * @returns A new ByteBuffer in MD5.
 */
export function md5 (buffer: forge.util.ByteStringBuffer) {
  return forge.md.md5.create().update(buffer.bytes()).digest();
}

export function aesDecrypt (data: string, {
  key = forge.util.createBuffer(),
  iv
}: AesEncryptionOptions) {
  // IV => Generate a MD5 ByteBuffer from current IV.
  if (iv && iv.length()) iv = md5(iv);
  // No IV => Create an empty buffer of 16 bytes.
  else iv = forge.util.createBuffer().fillWithByte(0, 16);

  // Get the buffer.
  const dataInBytes = forge.util.hexToBytes(data);
  const dataBuffer = forge.util.createBuffer(dataInBytes);

  // Start the decryption using 'AES-CBC' method.
  const decipher = forge.cipher.createDecipher("AES-CBC", md5(key));
  decipher.start({ iv });
  decipher.update(dataBuffer);
  decipher.finish();

  // Return the decrypted value.
  return decipher.output.bytes();
}

export function aesEncrypt (data: string, {
  key = forge.util.createBuffer(),
  iv
}: AesEncryptionOptions) {
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
  cipher.finish();

  // Return the encrypted buffer in HEX.
  return cipher.output.toHex();
}
