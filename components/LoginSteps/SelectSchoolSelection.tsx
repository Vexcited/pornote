import type { StateTypes } from "pages/login";
import type { Dispatch, SetStateAction } from "react";

type SelectionItemProps = {
  step: "specifyUrlGeolocation" | "specifyUrlManual" // Possible next steps.
  name: string;
  description: string;
}

type SelectSchoolSelectionProps = {
  state: StateTypes;
  setState: Dispatch<SetStateAction<StateTypes>>;
}

function SelectSchoolSelection ({ state, setState }: SelectSchoolSelectionProps) {
  
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
        step="specifyUrlGeolocation"
        name="Géolocation"
        description="Géolocalisez les établissements proches de votre localisation actuelle."
      />
      <SelectionItem
        step="specifyUrlManual"
        name="Manuel"
        description="Entrez manuellement, l'URL Pronote de votre établissement."
      />
    </div>
  );
}

export default SelectSchoolSelection;