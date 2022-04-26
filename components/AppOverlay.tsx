import type {
  PreloadedAccountData
} from "types/SavedAccountData";

import { useEffect, useState } from "react";
import Router, { useRouter } from "next/router";

import { useAccountsStore } from "@/webUtils/accountsStore";
import Link from "next/link";

import forge from "node-forge";
import { aesEncrypt } from "@/apiUtils/encryption";
import loginToPronote from "@/webUtils/loginToPronote";
import getBasePronoteUrl from "@/apiUtils/getBasePronoteUrl";

export default function withAppOverlay (Component: ({ account }: { account: PreloadedAccountData; }) => JSX.Element) {
  return function AppOverlay () {
    const router = useRouter();
    const url_slug = router.query.slug;

    const [userData, setUserData] = useState<PreloadedAccountData | null>(null);
    // Using default Pronote profile picture.
    const [userProfilePicture, setUserProfilePicture] = useState<string | null>(null);

    const updateAccount = useAccountsStore(store => store.updateAccount);

    useEffect(() => {
      if (!url_slug) return;

      const { accounts } = useAccountsStore.getState();
      if (!accounts) return; // Still loading...

      const account = accounts.find(account => account.slug === url_slug);
      if (!account) {
        Router.push("/");
        return;
      }

      setUserData(account);
    }, [url_slug]);

    const handleRefreshData = async () => {
      if (!userData) return;

      const loginData = await loginToPronote({
        pronoteUrl: userData.data.currentSessionData.pronoteUrl,
        cookie: userData.data.currentSessionData.loginCookie,
        usingEnt: userData.data.currentSessionData.usingEnt,
        entCookies: userData.data.currentSessionData.entCookies,
        entUrl: userData.data.currentSessionData.entUrl
      });

      if (!loginData) return;
      updateAccount(userData.slug, loginData);
      setUserData({ slug: userData.slug, data: loginData });
    };

    useEffect(() => {
      if (!userData) return;

      const pronoteBaseUrl = getBasePronoteUrl(userData.data.currentSessionData.pronoteUrl);
      console.log(pronoteBaseUrl);

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

    if (!userData) return (
      <p>
      Chargement...
      </p>
    );

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

        <button onClick={handleRefreshData}>Refresh les données</button>
        <Component account={userData} />
      </div>
    );
  };

}