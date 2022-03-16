export default function getAccountTypeFromUrl (url: string) {
  const path = new URL(url).pathname.replace("/pronote/", "");
  const accountType = { path, id: 0 };

  switch (path.replace(".html", "")) {
  case "eleve":
    accountType.id = 3;
    break;
  case "parent":
    accountType.id = 2;
    break;
  case "professeur":
    accountType.id = 1;
    break;
  case "accompagnant":
    accountType.id = 25;
    break;
  case "entreprise":
    accountType.id = 4;
    break;
  case "viescolaire":
    accountType.id = 13;
    break;
  }

  return accountType;
}