# Pornote (formerly `pronote-evolution`)

> Project still in development.

## Features

- [x] Multi-accounts (in preview)
- [x] Local save of informations fetched
- [ ] Updating informations after timeout using [`swr`](https://github.com/Vercel/swr)

## ENT Available

- **OpenENT**
  - `mon.lyceeconnecte.fr`

## TO-DO

- [ ] Finish login.tsx.
  - [x] Add multiple steps (select school, then account type, then ask for username/password).
  - [x] Check if ENT is available.
  - [x] Pass `Identification` step.
  - [x] Solve challenge to achieve an auth request.
  - [x] Do username/password challenge on client-side only.
  - [x] On successful login, store it in localforage->accounts.
  - [ ] ENT for ac-limoges.

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

### ENT - Steps

- POST `getEntCookies`
  - Parameters => `entUsername`, `entPassword`, `entUrl`.
    - `entUsername` is the username for the ENT.
    - `entPassword` is the password for the ENT
    - `entUrl` is the URL for the ENT. It will be used to determine the ENT login function.
- POST `getPronoteTicket`
  - Parameters => `entCookies`, `pronoteUrl`.
    - `entCookies` will be used in the header of the ENT login process to prevent re-login with credentials (prevent to store credentials locally also).
    - `pronoteUrl` will be used to get the ticket for login into the Pronote account.