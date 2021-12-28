import type { StateTypes } from "pages/login";
import type { Dispatch, SetStateAction } from "react";

type SelectionItemProps = {
  step: "specifyPronoteCredentials" | "specifyEntCredentials" // Possible next steps.
  name: string;
  description: string;
}

type SelectLoginSelectionProps = {
  state: StateTypes;
  setState: Dispatch<SetStateAction<StateTypes>>;
}

function SelectLoginSelection ({ state, setState }: SelectLoginSelectionProps) {

  const SelectionItem = ({ step, name, description }: SelectionItemProps) => {
    const updateStep = () => {
      setState({
        ...state,
        step
      });
    };

    return (
      <div
        onClick={updateStep}
        className="w-full p-4 bg-green-200 bg-opacity-40 hover:bg-opacity-60 transition-colors rounded cursor-pointer"
      >
        <h2 className="font-medium text-lg">{name}</h2>
        <p>{description}</p>
      </div>
    );
  };

  return (
    <div
      className="
        flex flex-col justify-center items-center gap-2
      "
    >
      <SelectionItem
        step="specifyEntCredentials"
        name="ENT"
        description="Connectez vous avec vos identifiants ENT."
      />
      <SelectionItem
        step="specifyPronoteCredentials"
        name="Identifiants Pronote"
        description="Connectez vous avec vos identifiants Pronote."
      />
    </div>
  );
}

export default SelectLoginSelection;