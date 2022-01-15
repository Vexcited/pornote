export type AccountType = {
  id: number;
  name: string;
  path: string;
};

export type EntData = {
  url: string;
  name: string;
};

export type SchoolInformations = {
  name: string;
  entUrl?: string;
  availableAccountTypes: AccountType[];
}

export type AccountMetadata = {
  name: string
  accountType: AccountType;
}