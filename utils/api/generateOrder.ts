import forge from "node-forge";

/**
 * Generates a MD5 ByteBuffer from another ByteBuffer.
 * @param buffer - ByteBuffer to convert to MD5.
 * @returns - A new ByteBuffer in MD5.
 */
function md5 (
  buffer: forge.util.ByteStringBuffer
): forge.util.ByteStringBuffer {
  return forge.md.md5.create().update(buffer.bytes()).digest();
}

export default function generateOrder (
  orderToEncrypt: number, // Starts from 1, then add 2 for next request.
  key = forge.util.createBuffer() // Default is empty ByteBuffer.
): string {
  const cipher = forge.cipher.createCipher(
    "AES-CBC",
    md5(key)
  );

  // Crea.te initialization vector.
  const iv = forge.util.createBuffer().fillWithByte(0, 16);
  cipher.start({ iv });
  
  // AES our order.
  cipher.update(
    forge.util.createBuffer(orderToEncrypt.toString(), "utf8")
  );

  cipher.finish();

  return cipher.output.toHex();
}
