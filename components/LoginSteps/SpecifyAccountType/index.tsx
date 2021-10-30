import type { StateTypes, UpdateStateType } from "pages/login";

import React from "react";

import {
    Button,
    Select,
    FormControl,
    InputLabel,
    MenuItem,

    // Types
    SelectChangeEvent
  } from "@mui/material";
  
export function SpecifyAccountType ({
    state,
    updateState
}: {
    state: StateTypes;
    updateState: UpdateStateType;
}) {
    const updateSelectedAccountType = (event: SelectChangeEvent<number>) => {
        const value = event.target.value;

        const accountTypeObject = state.availableAccountTypes.find(
            (accountType) => accountType.id === value
        );

        if (accountTypeObject) {
            updateState("accountType", accountTypeObject);
        }
    }

    return (
        <React.Fragment>
            <FormControl fullWidth>
                <InputLabel>Choisir un type de compte</InputLabel>
                <Select
                    label="Choisir un type de compte"
                    onChange={updateSelectedAccountType}
                    defaultValue={state.availableAccountTypes[0].id}
                >
                    {state.availableAccountTypes.map((accountType) => (
                        <MenuItem
                            key={accountType.id}
                            value={accountType.id}
                        >
                            {accountType.name}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <Button
                onClick={() => console.log(state)}
            >
                Sélectionner
            </Button>
        </React.Fragment>
    );
};