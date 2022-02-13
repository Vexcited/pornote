import type { MouseEventHandler } from "react";

type ButtonProps = {
  children: React.ReactNode;
  isButton?: boolean;
  buttonType?: "submit" | "button";
  onClick?: MouseEventHandler<HTMLAnchorElement | HTMLButtonElement>;
};

export default function Button ({
  children,
  isButton = true,
  buttonType = "button",
  onClick
}: ButtonProps) {

  const className = `
    rounded-full px-4 py-2
    bg-brand-light dark:bg-brand-primary
    text-brand-dark dark:text-brand-white
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
      <a
        onClick={onClick}
        className={className}
      >
        {children}
      </a>
    );
}