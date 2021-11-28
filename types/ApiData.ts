import type { PronoteFonctionParametres } from "types/PronoteData";

export type InformationsResponseData = {
    success: boolean;
    message: string;

    // Server's reponse (if request succeed).
    data?: PronoteFonctionParametres;
};