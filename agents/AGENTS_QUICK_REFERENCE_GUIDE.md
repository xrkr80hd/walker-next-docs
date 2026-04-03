# Agents Quick Reference Guide

## What This Is

This is the fast lookup sheet for the Walker Docs agent package in `agents/`.

Use it when you want to know:

- who to call
- what they own
- what kind of change they should handle

## Current Agents

### Mo

- File: `mo.agent.md`
- Role: Structure
- Job: product shape, workflow boundaries, MVP scope, migration framing
- Use Mo when: the request changes the app shape, page model, or framework direction

### Ezra

- File: `ezra.agent.md`
- Role: Routing
- Job: page placement, workflow sequence, navigation flow, route boundaries
- Use Ezra when: you need clean page structure or a better user flow

### Dan

- File: `dan.agent.md`
- Role: Schema
- Job: shared data contracts, storage rules, validation, ownership, backend-aware logic
- Use Dan when: local storage, shared fields, persistence, sync, or backend rules change

### Gabe

- File: `gabe.agent.md`
- Role: UI
- Job: screens, forms, components, interaction behavior, installability-facing UI
- Use Gabe when: structure is approved and you need layout or interface direction

### Josh

- File: `josh.agent.md`
- Role: Execution
- Job: phased implementation order, dependency sequencing, migration rollout
- Use Josh when: you know what to build and need the safest order

### Mike

- File: `mike.agent.md`
- Role: Audit
- Job: find weak assumptions, compatibility risks, scope creep, and maintainability problems
- Use Mike when: you want the plan or implementation challenged

### Nathan

- File: `nathan.agent.md`
- Role: Verify
- Job: compare claims to evidence and separate proven from unproven
- Use Nathan when: someone says the work is done and you want proof

### Scribe

- File: `scribe.agent.md`
- Role: Documentation Control
- Job: maintain agent docs, logs, trigger words, build manifests, and written-system consistency
- Use Scribe when: docs or the agent package need to be updated or audited

## Fast Pick Guide

- Need structure or migration framing: `Mo`
- Need route map or workflow flow: `Ezra`
- Need shared data/storage rules: `Dan`
- Need screens, forms, or UI direction: `Gabe`
- Need implementation order: `Josh`
- Need an audit: `Mike`
- Need proof: `Nathan`
- Need docs or agent-package cleanup: `Scribe`

## Full Sequence Vs Scoped Use

Use the full sequence when work changes workflow shape, routing, shared data behavior, print behavior, or framework direction.

- Full sequence default: `Mo -> Ezra -> Dan -> Gabe -> Josh -> Mike -> Nathan`
- Use a scoped path when the task is narrow and does not need every stage

Quick route picks:

- Route placement or workflow flow only: `Ezra -> Mike -> Nathan`
- Shared data contract only: `Dan -> Mike -> Nathan`
- UI review or layout change only: `Gabe -> Mike -> Nathan`
- Execution plan only: `Josh`, then `Mike` if risk review is needed
- Documentation or package cleanup only: `Scribe`

## Workspace Notes

- Support workspace root: `walker-support-workspace`
- Source-of-truth app repo: `/Users/xrkr80hd/Library/Mobile Documents/com~apple~CloudDocs/xrkr_space/Walker Docs Next/Source/walker-docs-next`
- Current app is a static document workflow app with print-sensitive forms
- Preserve print dimensions, autofill behavior, signature flow, and shared local state unless the user changes them explicitly

## Good Prompt Pattern

Give the agent:

- the goal
- the governing reference
- the current state
- the must-keep behaviors
- the constraints

Example:

```text
Mo, structure a staged migration plan for Walker Docs.
Governing reference: current workspace
Current state: static HTML/JS document workflow app
Constraints: preserve print fidelity and shared saved form data
```
