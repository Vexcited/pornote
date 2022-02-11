import type {
  SavedAccountData
} from "types/SavedAccountData";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import usePush from "@/webUtils/routerPush";

import { accountsStore, setAccountData } from "@/webUtils/accountsStore";
// import loginToPronote from "@/webUtils/loginToPronote";

export default function Dashboard () {
  const router = useRouter();
  const routerPush = usePush();
  const slug = router.query.slug as string;

  const [userData, setUserData] = useState<SavedAccountData | null>(null);
  const [navBarOpened, setNavBarOpened] = useState(false);

  useEffect(() => {
    if (!slug) return;

    (async () => {
      const data: SavedAccountData | null = await accountsStore.getItem(slug);

      if (!data) return routerPush("/login");

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
  }, [slug, routerPush]);

  if (!userData) return <p>Loading...</p>;

  return (
    <div className="w-screen h-screen bg-[#FFBECE]">
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
            w-full bg-[#FFBECE] pt-20 p-4
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