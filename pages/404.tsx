import { useTheme } from "next-themes";
import NextLink from "next/link";

import Button from "components/Button";

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
        <Button
          onClick={toggleTheme}
        >
          Theme
        </Button>
      </header>

      <main
        className="
          flex flex-col gap-2
          items-center justify-center
        "
      >
        <h1
          className="
            font-semibold text-lg
          "
        >
          404
        </h1>

        <p>
          Cette page n&apos;existe pas ou a été déplacée.
        </p>

        <NextLink href="/" passHref>
          <Button
            isButton={false}
          >
            Revenir à la page d&apos;accueil
          </Button>
        </NextLink>
      </main>
    </div>
  );
}