import type { ChangeEventHandler } from "react";

type InputTextProps = {
  placeholder: string;
  id: string;
  type?: string;

  inputClass?: string;
  labelColor?: string;

  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
};

export default function InputText ({
  id,
  placeholder,
  value,
  onChange,
  type = "text",
  inputClass = "text-gray-50",
  labelColor = "text-gray-100"
}: InputTextProps) {

  return (
    <div className="w-full flex flex-col">
      <label
        htmlFor={id}
        className={`font-semibold leading-none ${labelColor}`}
      >
        {placeholder}
      </label>
      <input
        id={id}
        type={type}
        placeholder=" "
        className={`leading-none p-3 focus:outline-none mt-4 rounded ${inputClass}`}
        value={value}
        onChange={onChange}
      />
    </div>
  )
}