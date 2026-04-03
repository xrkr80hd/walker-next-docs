# Agent Trigger Registry

## Purpose

This is the central registry for trigger words, shorthand commands, and package-level aliases used by the Walker Docs agent system.

## Package Rule

- Keep shared triggers here
- Do not duplicate trigger definitions across docs unless another file points back here
- Scribe owns consistency for this registry

## Agent Triggers

| Trigger | Maps To | Type | Scope | Notes |
| --- | --- | --- | --- | --- |
| `Mo` | `Moses / Structure` | agent | portable | primary short trigger |
| `mo` | `Moses / Structure` | agent | portable | lowercase alias |
| `Ezra` | `Ezra / Routing` | agent | portable | primary short trigger |
| `ezra` | `Ezra / Routing` | agent | portable | lowercase alias |
| `Dan` | `Dan / Schema` | agent | portable | primary short trigger |
| `dan` | `Dan / Schema` | agent | portable | lowercase alias |
| `Gabe` | `Gabe / UI` | agent | portable | primary short trigger |
| `gabe` | `Gabe / UI` | agent | portable | lowercase alias |
| `Josh` | `Josh / Execution` | agent | portable | primary short trigger |
| `josh` | `Josh / Execution` | agent | portable | lowercase alias |
| `Mike` | `Mike / Audit` | agent | portable | primary short trigger |
| `mike` | `Mike / Audit` | agent | portable | lowercase alias |
| `Nathan` | `Nathan / Verify` | agent | portable | primary short trigger |
| `nathan` | `Nathan / Verify` | agent | portable | lowercase alias |
| `Nate` | `Nathan / Verify` | alias | portable | common short-name alias |
| `nate` | `Nathan / Verify` | alias | portable | lowercase alias |
| `Scribe` | `Scribe / Documentation Control` | agent | portable | primary short trigger |
| `scribe` | `Scribe / Documentation Control` | agent | portable | lowercase alias |

## Workflow Shorthand

| Trigger | Maps To | Type | Scope | Notes |
| --- | --- | --- | --- | --- |
| `NB` | `NEW_BUILD` | workflow | portable | build from scratch |
| `OH` | `SITE_OVERHAUL` | workflow | portable | major restructure |
| `MOD` | `MODIFICATION` | workflow | portable | targeted change |
| `REF` | `REFRESH` | workflow | portable | polish without a full rebuild |
| `BE` | `BACKEND REQUIRED` | workflow | portable | shared data or backend behavior is involved |
| `PWA` | `INSTALLABILITY / OFFLINE WORK` | workflow | workspace | service worker, caching, install prompt, offline behavior |
| `DOC` | `DOCUMENT WORKFLOW CHANGE` | workflow | workspace | shared form fields, print layout, PDF/export, or document sequencing |

## Change Rule

- Update this file before spreading new trigger words into other docs
- If a trigger conflicts with an existing meaning, stop and resolve the conflict before reuse
- Keep workspace-only shorthand labeled clearly

## Confirmation Phrase

- `this pushes the ratio` means the proposed build is moving beyond the default restrained-effect baseline and must pause for an explicit yes-or-no confirmation before continuing
