import crypto from "crypto";

/*
 * This function checks if the "expected" value is same as
 * the "encrypted" one when decrypted.
 */
export default function checkOrdre (
  expected: string,
  encrypted: string,
  aesKeyText = "" // Default, empty string.
): boolean {
  const aesIv = Buffer.alloc(16); // Create a Buffer filled by zeros.
  const aesKey = crypto.createHash("md5").update(aesKeyText).digest("hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", aesKey, aesIv);
  
  decipher.setAutoPadding(false);

  const decrypted = 
    decipher.update(encrypted)
    + decipher.final();

  console.log(decrypted.toString());
  return decrypted === expected;  
}
