/**
 * A Pronote Session object extracted
 * from DOM.
 */
export type PronoteSession = {
  h: string; // Unique Session ID.
  a: number; // Account Type ID.
  d: any; // ??

  // RSA
  MR: string; // Modulus for RSA encryption.
  ER: string; // Exponent for RSA encryption.

  // Options
  sCrA: boolean; // Skip request encryption.
  sCoA: boolean; // Skip request compression.
};