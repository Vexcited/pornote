import forge from "node-forge";

export default function decryptOrder (
  order: string,
  key = forge.util.createBuffer(), // Default is empty buffer.
  iv = forge.util.createBuffer().fillWithByte(0, 16) // Default is 16 bytes of 0.
) {
  key = forge.md.md5.create().update(key.bytes()).digest();

  if (iv.length()) {
    iv = forge.md.md5.create().update(iv.bytes()).digest();
  }

  const orderBuffer = forge.util.createBuffer(forge.util.hexToBytes(order));
  const decipher = forge.cipher.createDecipher("AES-CBC", key);

  decipher.start({ iv });
  decipher.update(orderBuffer);
  decipher.finish();

  return decipher.output.bytes();
}