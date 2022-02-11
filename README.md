# Pornote (formerly `pronote-evolution`)

> Project still in development.

Remake of Pronote using real data from their functions.
It provides a better UI - *currently this is not true because the UI isn't finished* -,
local saves to access even offline - *this works* - and notifications - *currently not finished*.

## Features

- [x] Multi-accounts (using **slugs**)
- [x] Local save of informations fetched (with **localForage**)
- [ ] Updating informations after timeout using [`swr`](https://github.com/Vercel/swr)

## ENT Available

### OpenENT
  - [x] `mon.lyceeconnecte.fr`

### Missing ?

If your ENT is missing, please feel free to do a pull request or open
an Issue to see if it can be added.

ENT files and configurations are [here](./utils/api/cas).

## TO-DO

- [x] Finish login.tsx.
  - [x] Add multiple steps (select school, then account type, then ask for username/password).
  - [x] Check if ENT is available.
  - [x] Pass `Identification` step.
  - [x] Solve challenge to achieve an auth request.
  - [x] Do username/password challenge on **client-side only** (for security purposes).
  - [x] On successful login, store it in localForage(pornote)->accounts->(slug is key).
  - [x] ENT login support.
- [ ] Saved account data
  - [ ] Add `entCookies` with `loginCookie` (for ENT auto-reconnection).
  - [ ] Add `PageAccueil` to data.
  - [ ] Write optional types to `SavedAccountData` (for data about timetable, grades, ...).
- [ ] Multi-theme support
  - Create a 'theme' object key in localForage->pornote->(slug).
  - This object will contains HEX color values for each objects.
  - On load we add 'style' props to modified colors.
  - If the color isn't modified => keep default (from Tailwind) 

## Warning

This project is made for educational purposes.
That means that the project will not really be
maintained. You can still use this app, to do
everyday tasks, but when it comes to start a quiz,
or record yourself, or whatever that isn't in the
`Features` part, you should use the **real** Pronote
application. Note that **Index-Education** can take down
this project at anytime.

## Inner API

> Currently in build, it may change often !

This API is limited with CORS and was created to proxy Pronote's CORS
and to provide more easier requests to their functions.

### ENT - Steps

- POST `getEntCookies`
  - Parameters => `entUsername`, `entPassword`, `entUrl`.
    - `entUsername` is the username for the ENT.
    - `entPassword` is the password for the ENT
    - `entUrl` is the URL for the ENT. It will be used to determine the ENT login function.
<!-- - POST `getPronoteTicket`
  - Parameters => `entCookies`, `pronoteUrl`.
    - `entCookies` will be used in the header of the ENT login process to prevent re-login with credentials (prevent to store credentials locally also).
    - `pronoteUrl` will be used to get the ticket for login into the Pronote account. -->