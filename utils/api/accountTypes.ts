export enum AccountTypeIds {
  Commun = 0,
  Eleve = 3,
  Parent = 2,
  Professeur = 1,
  Accompagnant = 25,
  Entreprise = 4,
  VieScolaire = 13,
  Direction = 16,
  Academie = 5
};

export type AccountType = {
  id: number;
  name: string;
  path: string;
};

/** Default account on root path. */
export const commun: AccountType = {
  id: AccountTypeIds.Commun,
  name: "Commun",
  path: ""
};

export const eleve: AccountType = {
  id: AccountTypeIds.Eleve,
  name: "Élèves",
  path: "eleve.html"
};

export const parent: AccountType = {
  id: AccountTypeIds.Parent,
  name: "Parents",
  path: "parent.html"
};

export const professeur: AccountType = {
  id: AccountTypeIds.Professeur,
  name: "Professeurs",
  path: "professeur.html"
};

export const accompagnant: AccountType = {
  id: AccountTypeIds.Accompagnant,
  name: "Accompagnants",
  path: "accompagnant.html"
};

export const entreprise: AccountType = {
  id: AccountTypeIds.Entreprise,
  name: "Entreprises",
  path: "entreprise.html"
};

export const viescolaire: AccountType = {
  id: AccountTypeIds.VieScolaire,
  name: "Vie scolaire",
  path: "viescolaire.html"
};

export const direction: AccountType = {
  id: AccountTypeIds.Direction,
  name: "Direction",
  path: "direction.html"
};

export const academie: AccountType = {
  id: AccountTypeIds.Academie,
  name: "Académie",
  path: "academie.html"
};

const accountTypes = [
  commun,
  eleve,
  parent,
  professeur,
  accompagnant,
  entreprise,
  viescolaire,
  direction,
  academie
]; export default accountTypes;

export function getAccountTypeById (id: AccountTypeIds) {
  return accountTypes.find(type => type.id === id);
}