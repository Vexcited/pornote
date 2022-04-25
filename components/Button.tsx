import type { MouseEventHandler } from "react";
import NextLink from "next/link";

type ButtonProps = {
  children: React.ReactNode;
  isButton?: boolean;
  linkHref?: string;
  buttonType?: "submit" | "button";
  onClick?: MouseEventHandler<HTMLAnchorElement | HTMLButtonElement>;
};

export default function Button ({
  children,
  isButton = true,
  buttonType = "button",
  linkHref = "#",
  onClick
}: ButtonProps) {

  const className = `
    rounded-full px-4 py-2
    text-brand-dark dark:text-brand-white
    bg-brand-light hover:bg-opacity-80 bg-opacity-100
    dark:bg-brand-primary dark:hover:bg-opacity-80 dark:bg-opacity-100
    
    transition-colors text-center
  `;

  return isButton
    ? (
      <button
        type={buttonType}
        onClick={onClick}
        className={className}
      >
        {children}
      </button>
    )
    : (
      <NextLink
        href={linkHref}
      >
        <a
          onClick={onClick}
          className={`${className} cursor-pointer`}
        >
          {children}
        </a>
      </NextLink>
    );
}