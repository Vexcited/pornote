export type AccountType = {
    id: number;
    name: string;
    path: string;
};

export type SchoolInformations = {
    name: string;
    entAvailable: boolean;
    availableAccountTypes: AccountType[];
}

export type AccountMetadata = {
    name: string
    accountType: AccountType;
}