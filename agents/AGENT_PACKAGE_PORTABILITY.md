# Agent Package Portability Guide

## Purpose

This file defines how the custom agent package stays transportable and reusable across multiple workspaces.

## Source And Mirror

- `agents/` is the editable source of truth.
- `.git/agents/` is the synchronized local transport mirror.
- If both exist and differ, fix `agents/` first, then re-sync the mirror.

## What Must Travel Together

Transport the full package, not isolated files.

Required package contents:

- all `*.agent.md` role files
- `ADMIN_LOCAL_BYPASS_POLICY.md`
- `AGENT_PERMISSIONS_ACTIONS_ONE_SHEET.md`
- `AGENTS_QUICK_REFERENCE_GUIDE.md`
- `AGENT_TRIGGER_REGISTRY.md`
- `MY_WORKSPACE_GUIDE.md`
- `YOURLOCAL_ENGINE_GPT_COMPANION_UPDATE.md`

Critical rename-risk files inside the package:

- `AGENT_PERMISSIONS_ACTIONS_ONE_SHEET.md`
- `AGENT_HARD_LOCK_RULES.md`
- `YOURLOCAL_ENGINE_GPT_COMPANION_UPDATE.md`
- `AGENTS_QUICK_REFERENCE_GUIDE.md`

Optional to transport only when desired:

- `AGENT_ACTIVITY_LOG.md`
  - keep when you want package history
  - omit when starting a clean package in a new workspace

## Portable Vs Workspace-Specific

Portable content:

- agent identities
- roles and boundaries
- output formats
- trigger words with portable scope
- package sync rules
- package-level deployment safety rules

Workspace-specific content:

- repo-specific project rules
- local testing shortcuts tied to one app
- hidden mirror state
- environment-specific notes
- `.github/copilot-instructions.md` or the target workspace's equivalent instruction file

Rule:

- label workspace-specific items clearly before packaging them for another workspace
- do not assume a target workspace uses the same external instruction filename even if the `agents/` package is unchanged

## Packaging Workflow

1. Update the source files in `agents/`.
2. Update package-level docs when roles, triggers, or rules change.
3. Sync the mirror with `rsync -a --delete agents/ .git/agents/`.
4. Verify both trees match.
5. Copy the `agents/` package into the target workspace.
6. Re-check workspace-specific rules before using the package as-is.

## Scribe Ownership

Scribe owns:

- package documentation consistency
- trigger registry consistency
- portability labeling
- drift detection across source and mirror docs

Scribe does not own:

- implementation builds
- agent execution logic
- runtime app features

## Safe Reuse Rule

Do not assume a workspace-specific shortcut is portable.

Before reuse:

- inspect `.github/copilot-instructions.md`
- inspect `AGENT_TRIGGER_REGISTRY.md`
- remove or relabel workspace-specific commands
- confirm the target workspace wants the same phased agent order and guardrails

## Minimum Portable Checklist

- roles present
- quick reference present
- one-sheet present
- trigger registry present
- portability guide present
- companion update aligned
- workspace-specific items labeled
