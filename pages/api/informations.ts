import type { NextApiRequest, NextApiResponse } from "next";
import fetch from "node-fetch";

type Data = {
    success: boolean;
    message: string;
    debug?: {
        sessionId?: string;
        pronoteBaseUrl: string;
        data?: any;
    };
}

export default async (
    req: NextApiRequest,
    res: NextApiResponse<Data>
) => {
    if (req.method === "POST") {
        const {
            pronoteBaseUrl,
            sessionId,
            ordre,
            uuid,
            navId
        }: { 
            pronoteBaseUrl: string;
            sessionId: string;
            ordre: string;
            uuid: string;
            navId: string;
        } = req.body;

        const response = await fetch(
            pronoteBaseUrl + "/appelfonction/9/" + sessionId + "/" + ordre,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    nom: "FonctionParametres",
                    session: sessionId,
                    numeroOrdre: ordre,
                    donnees: {
                        "Uuid": uuid,
                        identifiantNav: navId
                    }
                })
            }
        );

        const data = await response.json();
        res.status(200).json({
            success: true,
            message: "Grabbed informations about school.",
            debug: {
                data,
                sessionId,
                pronoteBaseUrl
            }
        })
    }
    else {
        res.status(404).json({
            success: false,
            message: "Method doesn't exist."
        })
    }
}