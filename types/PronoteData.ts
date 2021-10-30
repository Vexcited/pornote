/**
 * A Pronote Session object extracted
 * from DOM with /utils/api/extractSession.
 */
export type PronoteSession = {
  h: string; // Unique Session ID.
  a: number; // Account Type ID.
  d: boolean; // ??

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


export type PronoteFonctionParametres = {
  nom: "FonctionParametres"; // Always "FonctionParametres".
        session: number; // Unique session ID.
        numeroOrdre: string; // Should be 2 (unencrypted).

        // Here is the data we are looking for.
        donneesSec: {
            nom: "FonctionParametres"; // Again (why ? idk).

            // Not sure about what it is (?)
            _Signature_: {
                ModeExclusif: boolean;
            }

            donnees: {
                listePolices: { // Array of available fonts (why ? idk again).
                    _T: number;
                    V: {
                        L: string;
                    }[];          
                };

                avecMembre: boolean;
                pourNouvelleCaledonie: boolean;
                genreImageConnexion: number;
                urlImageConnexion: string;
                logoProduitCss: string;
                
                Theme: number;
                
                identifiantNav: string; // Loooooong string.
                NomEtablissement: string; // School's name.
                NomEtablissementConnexion: string;
                
                logo: {
                    _T: number;
                    V: number;
                };
                
                anneeScolaire: string; // Curent school year.

                urlSiteIndexEducation: {
                    _T: number;
                    V: string; // URL to the Index-Education's website.
                };

                urlSiteInfosHebergement: {
                    _T: number;
                    V: string; // URL to the informations about website's host (?).
                };

                version: string; // Version of the software.
                versionPN: string; // Short version.
                millesime: string; // Current year.

                langue: string; // Current language.
                langID: 1036 | 1033 | 3082 | 1040; // Current language ID.
                listeLangues: {
                    _T: number;
                    V: {
                        langID: 1036 | 1033 | 3082 | 1040; // Languages ID.
                        description: "Français" | "English" | "Español" | "Italiano";
                    }[];
                };

                lienMentions: string; // Path to the informations page.
                
                espaces: {
                    _T: number;
                    V: {
                        G: 16 | 1 | 13 | 2 | 25 | 3 | 4 | 5; // Types ID.
                        L: "Direction" | "Professeurs" | "Vie scolaire" | "Parents" | "Accompagnants" | "Élèves" | "Entreprise" | "Académie";
                        url: string; // Path to the account type login page.
                    }[];
                }
            }
        };

        // Don't know what it contains (atm).
        donneesNonSec: {
            fichiers: string[];
        };
}