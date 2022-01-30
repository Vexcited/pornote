import type {
  SavedAccountData
} from "types/SavedAccountData";

import { useEffect } from "react";
import { useRouter } from "next/router";
import usePush from "@/webUtils/routerPush";

import { accountsStore } from "@/webUtils/accountsStore";
import loginToPronote from "@/webUtils/fetch/loginToPronote";

export default function Dashboard () {
  const router = useRouter();
  const routerPush = usePush();
  const slug = router.query.slug as string;

  useEffect(() => {
    if (!slug) return;

    (async () => {
      console.log("rendered");
      const data: SavedAccountData | null = await accountsStore.getItem(slug);

      if (!data) return routerPush("/login");

      const login = await loginToPronote({
        pronoteUrl: data.currentSessionData.pronoteUrl,
        accountId: data.currentSessionData.session.a,
        accountPath: data.currentSessionData.pronotePath,
        usingEnt: true,
        cookie: data.currentSessionData.loginCookie
      });

      console.log(data, login);
    })();
  }, [slug, routerPush]);

  return (
    <div>
      <h1>Dashboard</h1>
    </div>
  );
}