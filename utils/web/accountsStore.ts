import localforage from "localforage";

import type {
  SavedAccountData
} from "types/SavedAccountData";

// Create localforage store.
export const accountsStore = localforage.createInstance({
  name: "pornote",
  storeName: "accounts"
});

export const setAccountData = async (
  slug: string,
  accountData: SavedAccountData
) => {
  try {
    await accountsStore.setItem(slug, accountData);
    console.info(
      "Account", slug, "has been updated with data", accountData
    );
  }
  catch (e) {
    console.error(
      "Can't update account", slug,
      "with data", accountData
    );
    console.error(e);
  }
};