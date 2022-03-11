import type {
  PreloadedAccountData
} from "types/SavedAccountData";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import usePush from "@/webUtils/routerPush";

import { useStore } from "@/webUtils/store";
// import loginToPronote from "@/webUtils/loginToPronote";

export default function Dashboard () {
  const router = useRouter();
  const navigate = usePush();
  const url_slug = router.query.slug;

  const [userData, setUserData] = useState<PreloadedAccountData | null>(null);
  const [navBarOpened, setNavBarOpened] = useState(false);

  const accounts = useStore(store => store.accounts);

  useEffect(() => {
    console.info("Rendered dashboard !");
    if (!url_slug) return;

    (async () => {
      const data = accounts.find(account => account.slug === url_slug);
      if (!data) return navigate("/login");

      // const loginData = await loginToPronote({
      //   pronoteUrl: data.currentSessionData.pronoteUrl,
      //   accountId: data.currentSessionData.session.a,
      //   accountPath: data.currentSessionData.pronotePath,
      //   usingEnt: true,
      //   cookie: data.currentSessionData.loginCookie
      // });

      // if (loginData) {
      //   setAccountData(slug, loginData);
      //   setUserData(loginData);
      // }

      setUserData(data);
    })();
  }, [accounts, url_slug, navigate]);

  if (!userData) return <p>Loading...</p>;

  return (
    <div className="w-screen h-screen bg-brand-primary">
      <header
        className="
          fixed h-20 w-full bg-transparent
          flex flex-row justify-end
          items-center gap-4
          md:top-0 bottom-0
          px-6
        "
      >
        <ul
          className="
            flex flex-row gap-2
          "
        >
          <li>
            Emploi du temps
          </li>
          <li>
            Devoirs
          </li>
          <li>
            Contenu des cours
          </li>
          <li>
            Notes
          </li>
          <li>
            Mon Compte
          </li>
        </ul>

        <button
          onClick={() => setNavBarOpened(!navBarOpened)}
        >
          Open menu
        </button>

        <nav
          className={`
            fixed top-0 left-0 h-screen
            md:w-72 md:bg-transparent md:block
            w-full bg-brand-primary pt-20 p-4
            ${navBarOpened ? "" : "hidden"}          
          `}
        >

        </nav>
      </header>

      <main
        className="
          fixed left-0 top-0 bottom-0 right-0
          w-full h-full transition-all
          md:rounded-tl-2xl md:ml-72 md:mt-20 mb-20

          bg-brand-white
        "
      >

      </main>
    </div>
  );
}