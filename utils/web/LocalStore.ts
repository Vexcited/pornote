import localforage from "localforage";
import create from "zustand";
import createContext from "zustand/context";

interface LocalDatabaseState {
  accounts: { [slug: string]: any };
  setAccount: (slug: string, data: any) => void;
}

export const { Provider: StateProvider, useStore } = createContext<LocalDatabaseState>();

export function createLocalStore () {
  const initialState: LocalDatabaseState["accounts"] = {};

  localforage.iterate((value, key) => {
    initialState[key] = value;
  })
  .then(() => {
    console.info("useLocalDatabase => Finished storing the initial state.");
  })
  .catch((err) => {
    console.error("useLocalDatabase => An error was thrown.", err);
  });

  const createStore = create<LocalDatabaseState>((set, get) => ({
    accounts: initialState,
    setAccount: async (slug: string, data: any) => {
      await localforage.setItem(slug, data);
      const currentAccounts = get().accounts;
      currentAccounts[slug] = data;

      return set({ accounts: currentAccounts });
    }
  }));

  return createStore;
}
