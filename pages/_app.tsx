import type { AppProps } from "next/app";

function PronoteApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default PronoteApp;
