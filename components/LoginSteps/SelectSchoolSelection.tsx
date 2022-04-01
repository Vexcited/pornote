import type { StateTypes } from "pages/login";
import type { Dispatch, SetStateAction } from "react";

type SelectionItemProps = {
  /** Next steps ID. */
  step: "specifyUrlGeolocation" | "specifyUrlManual";

  // Visuals.
  name: string;
  description: string;
}

type SelectSchoolSelectionProps = {
  state: StateTypes;
  setState: Dispatch<SetStateAction<StateTypes>>;
}

/** Step 1: Select the method to type the Pronote URL - Manual or Geolocation. */
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
        className="
          w-full p-4

          border-2 border-brand-primary
          bg-brand-primary bg-opacity-20 hover:bg-opacity-80
          text-brand-dark dark:text-brand-white
          hover:text-brand-white  dark:hover:text-brand-dark

          transition-colors rounded cursor-pointer
        "
      >
        <h2 className="
          font-medium text-lg
        ">
          {name}
        </h2>
        <p className="
          opacity-60 dark:text-opacity-60
        ">
          {description}
        </p>
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
        name="Géolocalisation"
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