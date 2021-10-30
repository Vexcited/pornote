import type { StateTypes, UpdateStateType } from "pages/login";

import React, { useEffect } from "react";

import {
    Button,
    Select,
    FormControl,
    InputLabel,
    MenuItem,
    Typography,

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

        const accountTypeObject = state.schoolInformations.availableAccountTypes.find(
            (accountType) => accountType.id === value
        );

        if (accountTypeObject) {
            updateState("accountType", accountTypeObject);
        }
    }

    // Default account type state when the component mounts.
    useEffect(() => {
        if (state.accountType.id === 0) {
            updateState("accountType", state.schoolInformations.availableAccountTypes[0]);
        }
    }, []);

    return (
        <React.Fragment>
            <Typography variant="h5">
                Connexion au serveur Pronote {state.schoolInformations.name}
            </Typography>

            <FormControl>
                <InputLabel>Choisir un type de compte</InputLabel>
                <Select
                    label="Choisir un type de compte"
                    onChange={updateSelectedAccountType}
                    defaultValue={state.schoolInformations.availableAccountTypes[0].id}
                >
                    {state.schoolInformations.availableAccountTypes.map((accountType) => (
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
                variant="contained"
                onClick={() => updateState("step", 2)}
            >
                Sélectionner
            </Button>
        </React.Fragment>
    );
};