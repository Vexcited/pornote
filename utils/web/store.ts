import { useLayoutEffect } from "react";
import create from "zustand";
import createContext from "zustand/context";

import type { UseBoundStore, StoreApi } from "zustand";
import type { SavedAccountData, PreloadedAccountData } from "types/SavedAccountData";

import localforage from "localforage";

// Persisted store.
export const persistAccountsStore = localforage.createInstance({
  name: "pornote",
  storeName: "accounts"
});

export type StoreType = {
  accounts: PreloadedAccountData[];
  updateAccount: (slug: string, data: SavedAccountData) => Promise<void>;
  removeAccount: (string: string) => Promise<void>;
};

const zustandContext = createContext<StoreType>();
export const Provider = zustandContext.Provider;
export const useStore = zustandContext.useStore;

let store: undefined | UseBoundStore<StoreType>;

export const initializeStore = (preloadedAccounts: PreloadedAccountData[] = []) => {
  return create<StoreType>((set, get) => ({
    accounts: preloadedAccounts,
    updateAccount: async (slug, data) => {
      try {
        console.group(`[store] Updating account "${slug}"`);
        const accounts = get().accounts;

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

        const accounts = get().accounts;

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
};

export function useCreateStore(preloadedAccounts: PreloadedAccountData[]) {
  // For SSR & SSG, always use a new store.
  if (typeof window === "undefined") {
    return () => initializeStore([]);
  }

  // For CSR, always re-use same store.
  store = store ?? initializeStore(preloadedAccounts);
  // And if `preloadedAccounts` changes, then merge states in the next render cycle.
  //
  // eslint complaining "React Hooks must be called in the exact same order in every component render"
  // is ignorable as this code runs in same order in a given environment
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useLayoutEffect(() => {
    if (preloadedAccounts && store) {
      store.setState({
        ...store.getState(),
        ...preloadedAccounts,
      });
    }
  }, [preloadedAccounts]);

  return () => store as UseBoundStore<StoreType, StoreApi<StoreType>>;
}
