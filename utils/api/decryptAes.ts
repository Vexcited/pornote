import forge from "node-forge";
import md5 from "@/apiUtils/createMd5Buffer";

type DecryptOrderOptions = {
  key?: forge.util.ByteStringBuffer,
  iv?: forge.util.ByteStringBuffer
};

export default function decryptAes (data: string, {
  key = forge.util.createBuffer(),
  iv
}: DecryptOrderOptions) {
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
  const decrypted = decipher.output.bytes();
  return decrypted;
}