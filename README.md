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

Every request's `Content-Type` is `application/json` and every response are also given in JSON.

### Summary

- [API Error](#api-error)
- [Common Informations](#apicommoninformations)

### `/api/common_informations`

> [See code from source](./pages/api/common_informations.ts)

Route that sends a call to `FonctionParametres` without any data.
It is used to get informations about a school and its different account types available.

#### Request Body

```typescript
{
  pronoteUrl: string;
}
```

### API Error

When an error is thrown, the API always respond with an error message.

```typescript
{
  success: false,
  message: string,
  // This contains different informations
  // depending on the request and the error.
  debug?: any
}
```