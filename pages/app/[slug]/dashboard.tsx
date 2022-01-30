import { useEffect } from "react";
import { useRouter } from "next/router";
import usePush from "@/webUtils/routerPush";

import { accountsStore } from "@/webUtils/accountsStore";


export default function Dashboard () {
  const router = useRouter();
  const routerPush = usePush();
  const slug = router.query.slug as string;

  useEffect(() => {
    if (!slug) return;

    (async () => {
      console.log("rendered");
      const data = await accountsStore.getItem(slug);

      if (!data)
        return routerPush("/login");

      console.log(data);
    })();
  }, [slug, routerPush]);

  return (
    <div>
      <h1>Dashboard</h1>
    </div>
  );
}