import Head from "next/head";
import React from "react";

export default function Home () {
  // const [session, setSession] = React.useState("");
  const [pronoteUrl, setPronoteUrl] = React.useState("");

  const initializeSession = async (): Promise<void> => {
    const response = await fetch(
      "/api/informations",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          pronoteUrl
        })
      }
    );
    const data = await response.json();

    if (data.success) {
     // setSession(data.session.h);
    }
    else {
      // setSession("Erreur");
    }
  }

  return (
    <div>
      <Head>
        <title>Pronote Evolution</title>
        <meta name="description" content="Re-design de Pronote, avec de nouvelles fonctionnalités." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <input
        type="text"
        value={pronoteUrl}
        onChange={({ target }) => setPronoteUrl(target.value)}
      />

      <button
        onClick={initializeSession}
      >
        Initialiser une session
      </button>
    </div>
  )
}
