import { connect as connectOpenEnt } from "./openent";

const services = {
  "openent": connectOpenEnt
};

const urls = {
  "openent": ["mon.lyceeconnecte.fr"]
};

type Parameters = {
  url: string;
  username: string;
  password: string;
}
export default function getConnectFunction ({ url, username, password }: Parameters) {
  return [url, username, password];
}

// TODO !