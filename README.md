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

Every responses are typed in [`./types/ApiData.ts`](./types/ApiData.ts), and Pronote responses that are contained in the inner API responses are typed in [`./types/PronoteApiData.ts`](./types/PronoteApiData.ts).

### Summary

- [API Error](#api-error)
- [Common Informations](#apicommon_informations) - `FonctionParametres` (Account Type ID: `0`)
- [Informations](#apiinformations) - `FonctionParametres`
- [Identification](#apiidentification) - `Identification`

### `/api/common_informations`

> [See code from source](./pages/api/common_informations.ts)

Route that sends a call to `FonctionParametres` without any data, with common account (`0`).
It is used to get informations about a school and its different account types available.

#### Request Body

```typescript
{
  pronote_url: string;
}
```

### `/api/informations`

> [See code from source](./pages/api/informations.ts)

Route that sends a call to `FonctionParametres` with RSA identification to setup AES keys for encryption.
It is used to get informations about a school and its different account types available.

#### Request Body

```typescript
{
  pronote_url: string;

  /** Account Type ID to use. */
  pronote_account_type_id: number;

  /** Whether to parse (`getBasePronoteUrl`) Pronote URL or not. */
  use_raw_pronote_url: boolean;

  /**
   * Cookie used when getting Pronote HTML page.
   * Needed when creating a new session from ENT or an already set-up session.
   *
   * This will append `e` and `f` in to the HTML session object.
   */
  pronote_setup_account_cookie?: string;
}
```

### `/api/identification`

> [See code from source](./pages/api/identification.ts)

Send `Identification` to Pronote to get the challenge to complete, client-side,
in order to request `Authentification` (`/api/authentication`) to authenticate the user.

#### Request Body

```typescript
{
  pronote_url: string;

  /** Account Type ID of the user to authenticate. */
  pronote_account_type_id: number;

  /** Session from Pronote HTML: `parseInt(session.h)` */
  pronote_session_id: number;

  /** **Unencrypted** order to send to Pronote. */
  pronote_session_order: number;

  /** Username of the user to authenticate. */
  pronote_username: string;

  using_ent?: boolean;
}
```

### `/api/authentication`

> [See code from source](./pages/api/authentication.ts)

Send `Authentification` (`/api/authentication`) to Pronote with the resolved challenge, got from `Identification`), to authenticate the user.

#### Request Body

```typescript
{
  
}
```