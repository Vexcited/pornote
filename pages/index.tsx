import type { AccountMetadata } from "types/SavedAccountData";

import React from "react";
import localforage from "localforage";
import NextLink from "next/link";

import HomeLayout from "components/HomeLayout";

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
        <HomeLayout>
            <h1>Hey</h1>
        </HomeLayout>
    );
}
