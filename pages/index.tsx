import type { NextPage } from "next";
import Head from "next/head";

export default function Home (): NextPage {
  return (
    <div>
      <Head>
        <title>Pronote Evolution</title>
        <meta name="description" content="Re-design de Pronote, avec de nouvelles fonctionnalités." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <button
        onClick={handleSession}
      >
        Récupérer un ID de session
      </button>
    </div>
  );
}

export default Home
