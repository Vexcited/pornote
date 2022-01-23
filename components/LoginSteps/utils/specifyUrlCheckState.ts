import type { StateTypes } from "pages/login";
import type { Dispatch, SetStateAction } from "react";

type SpecifyUrlCheckStateProps = {
  state: StateTypes;
  setState: Dispatch<SetStateAction<StateTypes>>;
}

export default function specifyUrlCheckState ({
  state, setState
}: SpecifyUrlCheckStateProps) {
  const { name, availableAccountTypes, entUrl } = state.schoolInformations;

  if (name && availableAccountTypes.length > 0) {
    const nextStep = entUrl // Check if an ENT is available.
      ? "selectLoginSelection"
      : "specifyPronoteCredentials";

    // Move to next step.
    setState({
      ...state,
      step: nextStep
    });
  }
}