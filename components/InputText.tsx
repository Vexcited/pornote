import type { ChangeEventHandler } from "react";

type InputTextProps = {
  label?: string;
  placeholder?: string;
  id: string;
  type?: string;

  inputClass?: string;
  labelColor?: string;

  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
};

export default function InputText ({
  id,
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  inputClass = "text-gray-800",
  labelColor = "text-gray-600"
}: InputTextProps) {

  return (
    <div className="w-full flex flex-col">
      <label
        htmlFor={id}
        className={`font-semibold leading-none ${labelColor}`}
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        className={`leading-none p-3 focus:outline-none mt-4 rounded ${inputClass}`}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}