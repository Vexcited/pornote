import type { StateTypes, UpdateStateType } from "pages/login";

import React from "react";

import {
    Button,
    TextField,
    Typography
} from "@mui/material";
  
export function SpecifyCredentials ({
    state,
    updateState
}: {
    state: StateTypes;
    updateState: UpdateStateType;
}) {

    return (
        <React.Fragment>
            <Typography
                variant="h4"
                component="h3"
            >
                {state.schoolInformations.name}
            </Typography>

            <TextField
                label="Nom d'utilisateur"
                value={state.username}
                onChange={({ target }) => updateState("username", target.value )}
            />
            <TextField
                label="Mot de passe"
                type="password"
                value={state.password}
                onChange={({ target }) => updateState("password", target.value )}
            />
            <Button
                variant="contained"
                color="primary"
                onClick={() => console.log(state)}
            >
                Se connecter !
            </Button>
        </React.Fragment>
    );
}