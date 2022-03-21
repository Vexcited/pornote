import type {
  PreloadedAccountData
} from "types/SavedAccountData";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import usePush from "@/webUtils/routerPush";

import { useStore } from "@/webUtils/store";
import Link from "next/link";

import forge from "node-forge";
import { aesEncrypt } from "@/apiUtils/encryption";
import loginToPronote from "@/webUtils/loginToPronote";
import getServerUrl from "@/apiUtils/getBasePronoteUrl";

export default function Dashboard () {
  const router = useRouter();
  const navigate = usePush();
  const url_slug = router.query.slug;

  const [userData, setUserData] = useState<PreloadedAccountData | null>(null);
  // Using default Pronote profile picture.
  const [userProfilePicture, setUserProfilePicture] = useState<string | null>(null);

  const {
    accounts,
    updateAccount
  } = useStore(store => ({
    accounts: store.accounts,
    updateAccount: store.updateAccount
  }));

  useEffect(() => {
    console.info("Rendered dashboard !");
    if (!url_slug) return;

    (async () => {
      const account = accounts.find(account => account.slug === url_slug);
      if (!account) return navigate("/login");

      const loginData = await loginToPronote({
        pronoteUrl: account.data.currentSessionData.pronoteUrl,
        cookie: account.data.currentSessionData.loginCookie,
        usingEnt: account.data.currentSessionData.usingEnt,
        entCookies: account.data.currentSessionData.entCookies,
        entUrl: account.data.currentSessionData.entUrl
      });

      if (loginData) {
        updateAccount(account.slug, loginData);
        setUserData({ slug: account.slug, data: loginData });
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url_slug]);

  useEffect(() => {
    if (!userData) return;

    const pronoteBaseUrl = getServerUrl(userData.data.currentSessionData.pronoteUrl);

    if (userData.data.userInformations.ressource.avecPhoto) {
      const fileSessionData = JSON.stringify({
        Actif: true,
        N: userData.data.userInformations.ressource.N
      });

      const encryptedFilePath = aesEncrypt(fileSessionData, {
        iv: forge.util.createBuffer(userData.data.currentSessionData.iv),
        key: forge.util.createBuffer(userData.data.currentSessionData.key)
      });

      const fileName = "photo.jpg";
      const profilePicturePath = `FichiersExternes/${encryptedFilePath}/${fileName}?Session=${userData.data.currentSessionData.session.h}`;
      setUserProfilePicture(pronoteBaseUrl + profilePicturePath);
    }
    else {
      const profilePicturePath = "FichiersRessource/PortraitSilhouette.png";
      setUserProfilePicture(pronoteBaseUrl + profilePicturePath);
    }
  }, [userData]);

  if (!userData) return <p>Loading...</p>;

  return (
    <div className="w-screen h-screen bg-brand-white dark:bg-brand-dark">
      <nav
        className="
          fixed h-16 w-auto bg-brand-primary
          flex flex-row justify-end
          items-center gap-4
          right-0
          md:top-0 bottom-0
          px-6 m-2 rounded-2xl
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
        </ul>

        <Link href={`/app/${url_slug}/settings`} passHref>
          <a>
            <span
              className="
                cursor-pointer py-1 px-2 rounded-lg
                bg-brand-light dark:bg-brand-dark
                bg-opacity-60 hover:bg-opacity-80
                dark:bg-opacity-80 dark:hover:bg-opacity-100
                transition-colors
              "
            >
              {userData.data.userInformations.ressource.L}
            </span>

            {/* {userData.data.userInformations.ressource.avecPhoto && (
              <img
                src={userData.data.userInformations.ressource.avecPhoto}
              />
            )} */}
          </a>
        </Link>
      </nav>
    </div>
  );
}