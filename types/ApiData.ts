import type { PronoteFonctionParametres } from "types/PronoteData";
import type { EntData } from "./SavedAccountData";

export type InformationsResponseData = {
    success: boolean;
    message: string;

    /** Server's response. */
    pronoteData?: PronoteFonctionParametres;
    pronoteEntUrl?: string;
};