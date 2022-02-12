import { useTheme } from "next-themes";
import NextLink from "next/link";

export default function Page404 () {
  const { theme, setTheme } = useTheme();
  
  const toggleTheme = () => theme === "dark"
    ? setTheme("light")
    : setTheme("dark");

  return (
    <div
      className="
        bg-brand-primary dark:bg-brand-dark
        h-screen w-screen
      "
    >
      <header
        className="w-full h-16 flex flex-row justify-between px-4 items-center"
      >
        <span>
          Pornote
        </span>
        <button
          className="
            rounded-full px-4 py-2
            bg-brand-light dark:bg-brand-primary
            text-brand-dark dark:text-brand-white
          "
          onClick={toggleTheme}
        >
          Theme
        </button>
      </header>

      <main
        className="flex flex-col gap-2 items-center justify-center"
      >
        <h1>
          404
        </h1>
        
        <p>
          Cette page n'existe pas ou a été déplacée.  
        </p>

        <NextLink href="/">
          <a className="
            rounded-full px-4 py-2
            bg-brand-light dark:bg-brand-primary
            text-brand-dark dark:text-brand-white  
          ">
            Revenir à la page d'accueil
          </a>
        </NextLink>
      </main>
    </div>
  );
}