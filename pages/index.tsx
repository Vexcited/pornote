import type { AccountMetadata } from "types/SavedAccountData";

import React from "react";
import localforage from "localforage";
import NextLink from "next/link";

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
        <div className="h-screen w-screen bg-gray-200 text-gray-800">
            <h2 className="font-bold text-2xl">
                Gestion des comptes
            </h2>
            <p>Vous retrouvez, ici, tous vos comptes enregistrés localement.</p>

            {accounts.length === 0 ?
                <p>
                    Aucun compte présent !
                    <NextLink href="/login">
                        <button>
                            Connetez-vous à votre compte Pronote
                        </button>
                    </NextLink>
                </p>
            :
                accounts.map((account, key) =>
                    <div key={key}>
                        <h3>
                            {account.name}
                        </h3>
                    </div>
                )
            }
        </div>
    );
}
