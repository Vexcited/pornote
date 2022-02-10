import type { SavedAccountData } from "types/SavedAccountData";

import NextLink from "next/link";
import { useState, useEffect } from "react";

import { accountsStore } from "@/webUtils/accountsStore";

export default function Home () {
  type SavedAccounts = { [slug: string]: SavedAccountData };
  const [accounts, setAccounts] = useState<SavedAccounts | null>(null);

  useEffect(() => {
    const tempAccounts: SavedAccounts = {};
    accountsStore.iterate((accountData: SavedAccountData, slug) => {
      tempAccounts[slug] = accountData;
    })
      .then(() => {
        setAccounts(tempAccounts);
      });
  }, []);

  return (
    <div className="h-screen w-screen bg-brand-primary text-brand-white">
      <header className="fixed top-0 h-32 w-full flex flex-col items-center justify-center">
        <h1 className="font-bold text-3xl">Pornote</h1>
        <p className="text-lg">Client Pronote non-officiel.</p>
      </header>

      <section className="h-full w-full flex items-center justify-center py-32 px-4">
        {!accounts ? <p>Loading...</p>
          : Object.keys(accounts).length > 0
            ? (
              Object.entries(accounts).map(([slug, accountData]) =>
                <NextLink
                  href={`/app/${slug}/dashboard`}
                >
                  <div
                    className="bg-brand-white rounded-xl text-brand-primary"
                    key={slug}
                    >
                    <h2 className="font-semibold">
                      {accountData.userInformations.ressource.L} ({accountData.userInformations.ressource.classeDEleve.L})
                    </h2>
                    <p className="text-opacity-60">
                      {accountData.schoolInformations.General.NomEtablissement}
                    </p>
                  </div>
                </NextLink>
              )
            )
            : (
              <div className="flex flex-col justify-center items-center">
                <p className="text-md">Aucun compte sauvegardé localement</p>
                <NextLink href="/login">
                  <a className="m-2 px-6 py-4 rounded font-medium bg-brand-light bg-opacity-60 text-green-800 hover:bg-opacity-80 transition-colors">
                    Ajouter un compte Pronote
                  </a>
                </NextLink>
              </div>
            )
        }
      </section>

      <footer className="w-full fixed bottom-0 flex flex-col items-center justify-center h-16">
        <a className="font-medium text-brand-light hover:text-opacity-60 transition-colors" href="https://github.com/Vexcited/pornote">GitHub</a>
      </footer>
    </div>
  );
}
