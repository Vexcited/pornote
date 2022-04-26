import type { SavedAccountData, PreloadedAccountData } from "types/SavedAccountData";

import localforage from "localforage";
import create from "zustand";

// Persisted store.
export const persistAccountsStore = localforage.createInstance({
  name: "pornote",
  storeName: "accounts"
});

export interface AccountsStoreType {
  accounts: null | PreloadedAccountData[];
  updateAccount: (slug: string, data: SavedAccountData) => Promise<void>;
  removeAccount: (string: string) => Promise<void>;
};


export const useAccountsStore = create<AccountsStoreType>((set, get) => ({
  accounts: null,
  updateAccount: async (slug, data) => {
    try {
      console.group(`[store] Updating account "${slug}"`);
      const accounts = get().accounts ?? [];

      // If already exsists, first remove it.
      const cleanedAccounts = accounts.filter((account) => account.slug !== slug);
      console.info("Cleaned local state to remove possible `slug` duplicates.");

      // Update it from persisted store.
      await persistAccountsStore.setItem(slug, data);
      console.info("Updated account data in persistance.");

      const updatedAccounts = [...cleanedAccounts, { slug, data }];
      console.info("Add updated account data to local state.");

      // Update local state.
      set({ accounts: updatedAccounts });
      console.info("Updated local state.");
      console.groupEnd();
    }
    catch (e) {
      console.error(`Can't update account "${slug}" from persistance.`, e);
      console.groupEnd();
    }
  },
  removeAccount: async (slug) => {
    try {
      console.group(`[store] Removing account "${slug}"`);

      // Remove from persistance.
      await persistAccountsStore.removeItem(slug);
      console.info("Removed from persistance.");

      const accounts = get().accounts ?? [];

      // Remove from local state.
      const cleanedAccounts = accounts.filter((account) => account.slug !== slug);
      console.info("Removed from local state.", cleanedAccounts);

      set({ accounts: cleanedAccounts });
      console.info("Updated local state.");
      console.groupEnd();
    }
    catch (e) {
      console.error(`Can't remove account "${slug}" from persistance.`, e);
      console.groupEnd();
    }
  }
}));
