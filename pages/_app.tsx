import type { AppProps } from "next/app";

import { Fragment } from "react";
import { DefaultSeo } from "next-seo";
import SEO from "../next-seo.config";

// Styles
import "@fontsource/roboto";
import "tailwindcss/tailwind.css";

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
