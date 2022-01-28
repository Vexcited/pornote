import type { MouseEventHandler } from "react";

type ButtonProps = {
  children: React.ReactNode;
  isButton?: boolean;
  buttonType?: "submit" | "button";
  onClick?: MouseEventHandler<HTMLAnchorElement | HTMLButtonElement>;
  className?: string;
};

export default function Button ({
  children,
  isButton = true,
  buttonType = "button",
  onClick,
  className = "text-white bg-green-600 hover:bg-green-700"
}: ButtonProps) {
  const classWithCustom = `inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md ${className}`;
  
  return isButton 
    ? (
      <button
        onClick={onClick}
        type={buttonType}
        className={classWithCustom}
      >
        {children}
      </button>
    )
    :
    (
      <a
        onClick={onClick}
        className={classWithCustom}
      >
        {children}
      </a>
    );
}