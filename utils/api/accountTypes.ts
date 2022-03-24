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

/** Default account on root path. */
export const commun = {
  id: AccountTypeIds.Commun,
  name: "Commun",
  path: ""
};

export const eleve = {
  id: AccountTypeIds.Eleve,
  name: "Élèves",
  path: "eleve.html"
};

export const parent = {
  id: AccountTypeIds.Parent,
  name: "Parents",
  path: "parent.html"
};

export const professeur = {
  id: AccountTypeIds.Professeur,
  name: "Professeurs",
  path: "professeur.html"
};

export const accompagnant = {
  id: AccountTypeIds.Accompagnant,
  name: "Accompagnants",
  path: "accompagnant.html"
};

export const entreprise = {
  id: AccountTypeIds.Entreprise,
  name: "Entreprises",
  path: "entreprise.html"
};

export const viescolaire = {
  id: AccountTypeIds.VieScolaire,
  name: "Vie scolaire",
  path: "viescolaire.html"
};

export const direction = {
  id: AccountTypeIds.Direction,
  name: "Direction",
  path: "direction.html"
};

export const academie = {
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