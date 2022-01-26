import forge from "node-forge";

/**
 * Generates a MD5 ByteBuffer from another ByteBuffer.
 * @param buffer - ByteBuffer to convert to MD5.
 * @returns A new ByteBuffer in MD5.
 */
function md5 (
  buffer: forge.util.ByteStringBuffer
) {
  return forge.md.md5.create().update(buffer.bytes()).digest();
}

export default function generateOrder (
  orderToEncrypt: number, // Starts from 1, then add 2 for next request.
  key = forge.util.createBuffer(), // Default is empty buffer.
  iv = forge.util.createBuffer().fillWithByte(0, 16) // Default is 16 bytes of 0.
) {
  const cipher = forge.cipher.createCipher(
    "AES-CBC",
    md5(key)
  );

  // if (iv.length()) {
  //   iv = forge.md.md5.create().update(iv.bytes()).digest();
  // }

  cipher.start({ iv });

  // AES our order.
  cipher.update(
    forge.util.createBuffer(orderToEncrypt.toString(), "utf8")
  );

  return cipher.finish() && cipher.output.toHex();
}
