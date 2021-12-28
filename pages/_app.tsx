import type { AppProps } from "next/app";

import { DefaultSeo } from "next-seo";
import { Fragment } from "react";

// SEO Configuration
import SEO from "../next-seo.config";

// TailwindCSS
import "styles/globals.css";

export default function PronoteApp({
  Component,
  pageProps
}: AppProps) {
  return (
    <Fragment>
      <DefaultSeo {...SEO} />
      <Component {...pageProps} />
    </Fragment>
  );
}
