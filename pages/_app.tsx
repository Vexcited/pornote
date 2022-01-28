import type { AppProps } from "next/app";

import { DefaultSeo } from "next-seo";
import { Fragment } from "react";

// SEO Configuration
import SEO from "../next-seo.config";

// TailwindCSS
import "styles/globals.css";

import { StateProvider, createLocalStore } from "@/webUtils/LocalStore";

export default function PronoteApp({
  Component,
  pageProps
}: AppProps) {

  return (
    <Fragment>
      <DefaultSeo {...SEO} />
      <StateProvider createStore={createLocalStore}>
        <Component {...pageProps} />
      </StateProvider>
    </Fragment>
  );
}
