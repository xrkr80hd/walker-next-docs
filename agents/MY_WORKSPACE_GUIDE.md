# My Workspace Guide

## What This Is

This is the simple guide for using the Walker Docs workspace agents.

Think of it like this:

- the assistant is the main helper
- the agent files are specialist helpers
- the quick reference is the fast lookup sheet

## Where Things Are

- agent files live in `agents/`
- workspace instructions live in `AGENTS.md`
- local operating rules live in `.github/copilot-instructions.md`
- fast lookup sheet is `agents/AGENTS_QUICK_REFERENCE_GUIDE.md`
- activity log is `agents/AGENT_ACTIVITY_LOG.md`
- main app source is `Walker Docs App Folder/`

## What Each Agent Does

- `Mo` = structure the product or migration
- `Ezra` = map pages and workflow flow
- `Dan` = define shared data and storage rules
- `Gabe` = plan UI, forms, and interactions
- `Josh` = sequence implementation order
- `Mike` = audit weak spots and drift
- `Nathan` = verify claims against evidence
- `Scribe` = maintain docs, trigger words, logs, and package consistency

## Current Workspace Shape

- Walker Docs is currently a static HTML/CSS/JS app
- it is document-workflow oriented, not just marketing UI
- print behavior, signature behavior, autofill, and shared local state matter
- preserve those contracts unless the user explicitly changes them

## Quick Commands

- `NB` = new build
- `OH` = overhaul
- `MOD` = modification
- `REF` = refresh
- `BE` = backend or shared data rules are involved
- `PWA` = installability/offline/caching work
- `DOC` = document workflow or print-sensitive work

## How To Ask For Help

Use this pattern:

```text
[Agent Name], [task].
Governing reference: [file / repo / prompt]
Current state: [what exists now]
Constraints: [must-keep behaviors and limits]
```

## Easy Example

```text
Mo, structure a migration plan for Walker Docs.
Governing reference: current workspace
Current state: static HTML/JS document workflow app
Constraints: preserve print fidelity and shared saved form data
```

## If You Are Not Sure Who To Use

Start here:

- need structure or migration framing: `Mo`
- need route or flow cleanup: `Ezra`
- need shared data or storage rules: `Dan`
- need forms or UI direction: `Gabe`
- need build order: `Josh`
- need critique: `Mike`
- need proof: `Nathan`
- need docs or package cleanup: `Scribe`
