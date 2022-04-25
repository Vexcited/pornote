import { Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { HiSelector, HiCheck } from "react-icons/hi";

type SelectInputProps = {
  value: any;
  onChange: (value: any) => void;

  placeholder: string;
  children: React.ReactNode;
};

export function SelectInput ({
  value,
  onChange,
  placeholder,
  children
}: SelectInputProps) {
  return (
    <Listbox value={value} onChange={onChange}>
      <div className="relative mt-1 w-full">
        <Listbox.Button
          className="
            relative w-full py-2 pl-3 pr-10 text-left
            bg-brand-white rounded-lg cursor-default

            sm:text-sm
          "
        >
          <span className="block truncate dark:text-brand-dark font-medium">{placeholder}</span>
          <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <HiSelector
              className="w-5 h-5 text-brand-primary"
              aria-hidden="true"
            />
          </span>
        </Listbox.Button>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options
            className="
              absolute w-full py-1 mt-1 overflow-auto
              text-base bg-brand-white rounded-md shadow-lg
              max-h-60 ring-1 ring-brand-dark
              ring-opacity-5 focus:outline-none sm:text-sm
            "
          >
            {children}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
}

type SelectInputOptionProps = {
  value: any;
  name: string;
};

export function SelectInputOption ({ value, name }: SelectInputOptionProps) {
  return (
    <Listbox.Option
      className={({ active }) =>
        `${active ? "bg-green-50" : ""}
        cursor-pointer select-none relative py-2 pl-10 pr-4`
      }
      value={value}
    >
      {({ selected, active }) => (
        <Fragment>
          <span
            className={`${
              selected ? "font-medium text-green-600" : "font-normal text-green-800"
            } ${
              active ? "text-green-700" : ""
            } 
              block truncate
            `}
          >
            {name}
          </span>

          {selected ? (
            <span
              className={`${
                active ? "text-green-700" : ""
              } 
                text-green-600 absolute inset-y-0 left-0 flex items-center pl-3
              `}
            >
              <HiCheck className="w-5 h-5" aria-hidden="true" />
            </span>
          ) : null}
        </Fragment>
      )}
    </Listbox.Option>
  );
}