import type { AccountMetadata } from "types/SavedAccountData";

import { useState, useEffect } from "react";
import localforage from "localforage";
import NextLink from "next/link";

export default function Home () {
  const [accounts, setAccounts] = useState<AccountMetadata[]>([]);

  // We try to see if there's already
  // saved accounts in the localforage.
  useEffect(() => {
    (async () => {
      try {
        const savedAccounts: AccountMetadata[] | null = await localforage.getItem("accounts");

        // If there's already saved accounts, we store them to state.
        if (savedAccounts) setAccounts(savedAccounts);

        // If not, we create an empty array to save them.
        if (!savedAccounts) {
          await localforage.setItem("accounts", []);
        }
      }
      catch (e) {
        console.error(e);
      }
    })();
  }, []);

  return (
    <div className="h-screen w-screen bg-green-50 text-green-900">
      <header className="fixed top-0 h-32 w-full flex flex-col items-center justify-center">
        <h1 className="font-bold text-3xl">Pornote</h1>
        <p className="text-lg">Client Pronote non-officiel.</p>
      </header>

      <section className="h-full w-full flex items-center justify-center py-32 px-4">
        {accounts.length > 0
          ? (
            <div className="">

            </div>
          )
          : (
            <div className="flex flex-col justify-center items-center">
              <p className="text-md">Aucun compte sauvegardé localement</p>
              <NextLink href="/login">
                <a className="m-2 px-6 py-4 rounded font-medium bg-green-200 bg-opacity-60 text-green-800 hover:bg-opacity-80 transition-colors">
                  Ajouter un compte Pronote
                </a>
              </NextLink>
            </div>
          )
        }
      </section>

      <footer className="w-full fixed bottom-0 flex flex-col items-center justify-center h-16">
        <a className="font-medium text-green-700 hover:text-green-500 transition-colors" href="https://github.com/Vexcited/pornote">GitHub</a>
      </footer>
    </div>
  );
}
