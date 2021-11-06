import type { AppProps } from "next/app";
import "tailwindcss/tailwind.css";

export default function PronoteApp({
  Component,
  pageProps
}: AppProps) {
  return <Component {...pageProps} />;
}
