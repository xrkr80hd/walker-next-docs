# Admin Local Bypass Policy

## Purpose

This policy defines the only acceptable way to bypass admin authentication for local testing inside this workspace package.

This file is intended to travel with `agents/` and stay portable across projects.
In Vercel-heavy workspaces, treat this policy as a baseline safety rule, not as optional local advice.

## Scope

Use admin bypass only for:

- local development
- local browser testing
- temporary QA on a machine you control

Do not use admin bypass for:

- Vercel production
- Vercel preview deployments
- any pushed branch intended for deployment
- shared staging unless the repo owner explicitly asks for it

## Command Words

- `TOFTON` = turn local admin bypass on
- `TOFTOFF` = turn local admin bypass off
- do not use raw `TOFT`

These commands are explicit on purpose and should never act like a toggle.

## Core Rule

- admin bypass must be local-only
- admin bypass must never be committed as an enabled deployed state
- admin bypass must be turned off immediately after testing
- any repo that deploys frequently to Vercel must default to normal auth

## Portable Implementation Rule

Do not hardcode one app path in this package policy.

The active project may use any of these local-only config files:

- `.env.local`
- `.env`
- another uncommitted local env file defined by that repo

The repo-specific implementation may vary, but the safe state does not:

- local test state: `ADMIN_BYPASS_AUTH=true`
- normal state: `ADMIN_BYPASS_AUTH=false`

## Safe Local Workflow

1. Open the active app's local-only env file.
2. Set:

```env
ADMIN_BYPASS_AUTH=true
```

1. Start or restart the local app using that repo's normal local run command.
2. Test the admin flow locally only.
3. As soon as testing is done, change the value back to:

```env
ADMIN_BYPASS_AUTH=false
```

1. Restart the local app if required.
2. Confirm admin requires login again.

## Vercel Safety Rule

If you do frequent Vercel deployments, always assume bypass is unsafe unless proven local-only.

Before any push or deployment:

- confirm `ADMIN_BYPASS_AUTH` is not enabled in tracked files
- confirm the local bypass value is not being sourced by Vercel env vars
- confirm the repo's deployable state expects real admin auth

## Never Deploy This State

Do not deploy with any of these conditions true:

- `ADMIN_BYPASS_AUTH=true` in a tracked file
- `ADMIN_BYPASS_AUTH=true` in Vercel project environment variables
- preview or production behavior depends on bypassed auth

## Repo-Specific Notes Rule

If a specific project needs exact commands, keep those details in that repo's own docs.

This file stays package-portable and should only define:

- the trigger words
- the allowed scope
- the forbidden scope
- the required safe reset behavior

## Strict Consistency Rule

- testing mode: `ADMIN_BYPASS_AUTH=true`
- normal mode: `ADMIN_BYPASS_AUTH=false`
- deployed mode: never bypass
- after testing: always return to `false` immediately
