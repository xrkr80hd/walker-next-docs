# Agent Hard Lock Rules

## Purpose

This file stores non-negotiable interface, document, and migration locks for the Walker Docs workspace.

Use this file when a visual, workflow, print, or implementation rule must stay stable across prompts, builds, reviews, and rebuilds.

## Scope

- applies alongside `agents/AGENT_PERMISSIONS_ACTIONS_ONE_SHEET.md`
- UI and workflow work should treat these as hard constraints
- rules here win unless the user explicitly overrides them

## Current Hard Locks

### Shape And Surface

- no round pills
- no `rounded-full`
- no soft bubble UI
- use square, defined, clean, professional boxes only

### Mobile Scaling Rule

- all builds must scale cleanly to mobile
- do not simply shrink desktop layouts until they become cramped or awkward
- reflow, stack, or break layouts properly when needed
- text, controls, and form fields must remain readable and usable on small screens

### Multi-Item Navigation Rule

- do not scatter multiple floating controls across the interface
- if a screen gains multiple grouped actions, use a structured list, grouped panel, or accordion
- navigation order must stay obvious at a glance

### Document Fidelity Rule

- do not casually break existing print dimensions
- do not add decorative layout changes that interfere with printable form clarity
- preserve document readability at `8.5x11` intent unless the task explicitly changes the format
- if a change affects `print-exact.js`, signatures, export flows, or any form page layout, review compatibility before claiming success

### Shared Data Contract Rule

- do not rename shared field ids, field names, storage keys, or serialized data contracts without an explicit compatibility pass
- if a field is reused across multiple pages, treat it as a shared contract, not a local detail

### Framework Migration Gate

- if the proposed work changes the runtime model such as `Next.js`, PWA, SPA shell behavior, service workers, or cache strategy, stop and plan first
- migration work requires a staged rollout and rollback path before implementation begins

### Effect Ratio Confirmation Rule

- default builds may use restrained shadows, overlays, and depth
- if a proposal pushes beyond the default restrained range, stop and ask for confirmation before proceeding
- use a plain confirmation gate such as: `This pushes the ratio. Do you still want to build? Yes or no?`
- do not treat silence as approval

## Quick Read Version

- no pills
- no round UI
- mobile must reflow cleanly
- grouped actions stay structured
- print fidelity matters
- shared field/data contracts are sensitive
- framework migrations need a staged plan first
- if effects push the ratio, ask first

### Work Log Rule

- every implementation session MUST use `PLANNED_WORK_LOG.md` and `COMPLETED_WORK_LOG.md`
- BEFORE any code change: READ `PLANNED_WORK_LOG.md` and `COMPLETED_WORK_LOG.md` FIRST to understand current state
- step A: log all planned tasks in `PLANNED_WORK_LOG.md` BEFORE starting any code changes
- step B: after finishing, move completed work to `COMPLETED_WORK_LOG.md` with build verification
- both steps are mandatory, not optional
- checking the logs FIRST is mandatory — do not start work blind
- skipping any step is a guardrail violation
