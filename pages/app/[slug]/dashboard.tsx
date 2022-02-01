import type {
  SavedAccountData
} from "types/SavedAccountData";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import usePush from "@/webUtils/routerPush";

import { accountsStore, setAccountData } from "@/webUtils/accountsStore";
import loginToPronote from "@/webUtils/fetch/loginToPronote";

export default function Dashboard () {
  const router = useRouter();
  const routerPush = usePush();
  const slug = router.query.slug as string;

  const [userData, setUserData] = useState<SavedAccountData | null>(null);

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
    <div className="w-full h-full bg-brand-light">
      <header
        className="
          h-20 w-full bg-brand-primary
          flex flex-row
        "
      >
        <ul>
          <li>
            user
          </li>
          <li>
            user
          </li>
          <li>
            user
          </li>
        </ul>

        <nav
          className="fixed top-0 left-0 w-24 h-full bg-brand-primary"
        >

        </nav>
      </header>

    </div>
  );
}