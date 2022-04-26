import NextLink from "next/link";

import { useAccountsStore } from "@/webUtils/accountsStore";
import { useTheme } from "next-themes";

import Button from "components/Button";

export default function Home () {
  const accounts = useAccountsStore(state => state.accounts);
  console.log(accounts);

  const { theme, setTheme } = useTheme();
  const toggleTheme = () => theme === "dark" ? setTheme("light") : setTheme("dark");

  return (
    <div className="h-screen w-screen bg-brand-primary dark:bg-brand-dark text-brand-white">
      <header className="fixed top-0 w-full py-4 flex flex-col items-center justify-start">
        <h1 className="font-bold text-3xl dark:text-brand-primary">Pornote</h1>
        <p className="text-lg text-brand-light mb-4">Client Pronote non-officiel.</p>

        <Button
          onClick={toggleTheme}
        >
          {theme === "light" ? "Mode Sombre" : "Mode Clair"}
        </Button>
      </header>

      <section className="h-full w-full flex items-center justify-center py-32 px-4">
        {!accounts ? <p>Loading...</p>
          : accounts.length > 0
            ? (
              accounts.map(account =>
                <NextLink
                  key={account.slug}
                  href={`/app/${account.slug}/dashboard`}
                  passHref
                >
                  <div
                    className="
                      bg-brand-white rounded-xl text-brand-primary
                      p-4 cursor-pointer hover:bg-opacity-80 transition-colors
                      hover:shadow-sm
                    "
                    key={account.slug}
                  >
                    <h2 className="font-semibold">
                      {account.data.userInformations.ressource.L} ({account.data.userInformations.ressource.classeDEleve.L})
                    </h2>
                    <p className="text-opacity-60">
                      {account.data.schoolInformations.General.NomEtablissement}
                    </p>
                  </div>
                </NextLink>
              )
            )
            : (
              <div className="
                flex flex-col justify-center items-center gap-4 max-w-md p-6 rounded-lg

                dark:bg-brand-primary dark:bg-opacity-20 dark:border-2 dark:border-brand-primary
                bg-brand-dark bg-opacity-20 border-2 border-brand-dark
              ">
                <p className="text-sm sm:text-base opacity-100 text-center">
                  Aucun compte sauvegardé localement !
                </p>
                <Button
                  isButton={false}
                  linkHref="/login"
                >
                  Ajouter un compte Pronote
                </Button>
              </div>
            )
        }
      </section>

      <footer className="w-full fixed bottom-0 flex flex-col items-center justify-center h-16">
        <a
          className="font-medium text-brand-light dark:text-brand-white hover:text-opacity-60 transition-colors"
          href="https://github.com/Vexcited/pornote"
        >
          GitHub
        </a>
      </footer>
    </div>
  );
}
