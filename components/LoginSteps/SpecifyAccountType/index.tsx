import type { AccountType } from "types/SavedAccountData";

import React, { useState } from "react";

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
    pronoteAccountTypes,
    pronoteAccountType,
    setPronoteAccountType
}: {
    pronoteAccountTypes: AccountType[],
    pronoteAccountType: AccountType | null,
    setPronoteAccountType: React.Dispatch<React.SetStateAction<AccountType | null>>
}) {

    const updateSelectedAccountType = (event: SelectChangeEvent<unknown>) => {
        const value = event.target.value as number;

        const accountTypeObject = pronoteAccountTypes.find(
            (accountType) => accountType.id === value
        ) ?? null;

        setPronoteAccountType(accountTypeObject);

        console.log(value, pronoteAccountType);
    }

    return (
        <React.Fragment>
            <FormControl fullWidth>
                <InputLabel>Choisir un type de compte</InputLabel>
                <Select
                    label="Choisir un type de compte"
                    onChange={updateSelectedAccountType}
                >
                    {pronoteAccountTypes.map((accountType) => (
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
                onClick={() => console.log(pronoteAccountType)}
            >
                Sélectionner
            </Button>
        </React.Fragment>
    );
};