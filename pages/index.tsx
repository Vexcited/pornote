import type { AccountMetadata } from "types/SavedAccountData";

import React from "react";
import localforage from "localforage";
import NextLink from "next/link";

import {
    Typography,
    Button
} from "@mui/material";

export default function Home () {
    const [accounts, setAccounts] = React.useState<AccountMetadata[]>([]);

    /**
     * We try to see if there's already
     * saved accounts in the localforage.
     */
    React.useEffect(() => {
        (async () => {
            try {
                const stored: AccountMetadata[] | null = await localforage.getItem("accountsMetadata");

                /**
                 * If there's already saved accounts,
                 * we store them to state.
                 */
                if (stored) {
                    setAccounts(stored);
                }
                /**
                 * If not, we save an empty array.
                 */
                else {
                    await localforage.setItem("accountsMetadata", [])
                    .then(item => console.log("[localforage][accountsMetadata] Initalized empty array.", item))
                    .catch(console.error);
                }
            }
            catch (e) {
                console.error(e);
            }
        })();
    }, []);

    return (
        <div>
            <Typography variant="h2" component="h1">Gestion des comptes</Typography>
            <Typography>Vous retrouvez, ici, tous vos comptes enregistrés localement.</Typography>

            {accounts.length === 0 ?
                <Typography>
                    Aucun compte présent !
                    <NextLink href="/login">
                        <Button variant="contained">
                            Connetez-vous à votre compte Pronote
                        </Button>
                    </NextLink>
                </Typography>
            :
                accounts.map((account, key) =>
                    <div key={key}>
                        <Typography variant="h3" component="h3">
                            {account.name}
                        </Typography>
                    </div>
                )
            }
        </div>
    );
}