import type { AppProps } from "next/app";

export default function PronoteApp({
  Component,
  pageProps
}: AppProps) {
  return <Component {...pageProps} />;
}