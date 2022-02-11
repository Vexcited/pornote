import type { AppProps } from "next/app";

import { DefaultSeo } from "next-seo";
import { Fragment } from "react";

// SEO Configuration
import SEO from "../next-seo.config";

// Fonts
import "@fontsource/poppins/300.css";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";

// TailwindCSS
import "styles/globals.css";

// Themes
import { ThemeProvider } from "next-themes";

export default function PronoteApp({
  Component,
  pageProps
}: AppProps) {
  return (
    <Fragment>
      <DefaultSeo {...SEO} />
      <ThemeProvider attribute="class">
        <Component {...pageProps} />
      </ThemeProvider>
    </Fragment>
  );
}
