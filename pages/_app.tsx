import type { AppProps } from "next/app";
import { Fragment, useState, useEffect } from "react";

// SEO Configuration
import { DefaultSeo } from "next-seo";
import SEO from "../next-seo.config";

// Fonts
import "@fontsource/poppins/latin-300.css";
import "@fontsource/poppins/latin-400.css";
import "@fontsource/poppins/latin-500.css";

// TailwindCSS
import "styles/globals.css";

// Themes
import { ThemeProvider } from "next-themes";

// Global State
import { useCreateStore, Provider, persistAccountsStore, useStore } from "@/webUtils/store";
import type { PreloadedAccountData, SavedAccountData } from "types/SavedAccountData";

export default function PronoteApp({
  Component,
  pageProps
}: AppProps) {
  const [loaded, setLoaded] = useState(false);

  const createdStore = useCreateStore([])();

  useEffect(() => {
    async function loadSavedAccounts () {
      const accounts: PreloadedAccountData[] = [];

      await persistAccountsStore.iterate((accountData: SavedAccountData, slug) => {
        accounts.push({ slug, data: accountData });
      });

      createdStore.setState({ accounts });
      console.info("Accounts loaded and saved into local state.");

      setLoaded(true);
    }

    loadSavedAccounts();
  }, [createdStore]);

  return (
    <Fragment>
      <DefaultSeo {...SEO} />
      <ThemeProvider attribute="class">
        {(loaded) ? (
          <Provider createStore={() => createdStore}>
            <Component {...pageProps} />
          </Provider>
        ) : (
          <div className="h-screen w-screen bg-brand-primary dark:bg-brand-dark text-brand-white">
            <h2>Chargement.. </h2>
          </div>
        )}
      </ThemeProvider>
    </Fragment>
  );
}
