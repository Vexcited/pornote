/**
 * A Pronote Session object extracted
 * from DOM with /utils/api/extractSession.
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

/**
 * An item from results array returned
 * by Pronote when calling their Geolocation API.
 */
export type PronoteGeolocationResult = {
  // Global informations.
  url: string; // Pronote Server URL.
  nomEtab: string; // School's name.

  // Geolocation informations.
  lat: string; // School's latitude.
  long: string; // School's longitude.  
  cp: string; // School's postal code.
};
