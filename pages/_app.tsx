import type { AppProps } from "next/app";

import { DefaultSeo } from "next-seo";
import SEO from "../next-seo.config";
import { Fragment } from "react";

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
