import type { NextApiRequest, NextApiResponse } from "next";
import type { PronoteGeolocationResult } from "types/PronoteData";

import fetch from "node-fetch";

type ResponseData = {
    success: boolean;
    message?: string;
    results?: PronoteGeolocationResult[];
};

type RequestData = {
    latitude: number;
    longitude: number;
};

export default async function handler (
    req: NextApiRequest,
    res: NextApiResponse<ResponseData>
) {
    if (req.method === "POST") {
        const { latitude, longitude }: RequestData = req.body;

        if (latitude && longitude) {
            // We try to get a response from Pronote.
            const pronoteResponse = await fetch(
                "https://www.index-education.com/swie/geoloc.php", // URL from the Pronote APK.
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
                    },
                    body: `data=${JSON.stringify({
                        nomFonction: "geoLoc", // Geolocation
                        lat: latitude.toString(),
                        long: longitude.toString()
                    })}`
                }
            );

            // We get the response.
            // If the data isn't an array (no results),
            // then we create it ourselves (prevent errors).
            const pronoteDataRaw = await pronoteResponse.json();
            const data: PronoteGeolocationResult[] = Array.isArray(pronoteDataRaw) ? pronoteDataRaw : [];

            res.status(200).json({
                success: true,
                results: data // We return what Pronote sended us.
            });
        }
        else {
            res.status(400).json({
                success: false,
                message: "Parameters 'longitude' and/or 'latitude' undefined."
            });
        }
    }
    else {
        res.status(404).json({
            success: false,
            message: "Method doesn't exist."
        });
    }
}