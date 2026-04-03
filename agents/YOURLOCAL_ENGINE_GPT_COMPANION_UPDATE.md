# Workspace Engine GPT Companion Update

## Purpose

This document configures the companion workflow for the Walker Docs workspace.

This version keeps agent permissions and actions in one canonical source:

- `agents/AGENT_PERMISSIONS_ACTIONS_ONE_SHEET.md`

## Canonical Reference Order

Use references in this order:

1. `agents/AGENT_PERMISSIONS_ACTIONS_ONE_SHEET.md`
2. `agents/*.agent.md`
3. `AGENTS.md`
4. `.github/copilot-instructions.md`
5. `agents/AGENTS_QUICK_REFERENCE_GUIDE.md`
6. `agents/ADMIN_LOCAL_BYPASS_POLICY.md` when auth bypass is relevant

If there is any mismatch, the one-sheet controls permissions and actions.

## What This System Does

This workspace uses a planning-first, agent-led workflow for website and app work, with extra protection around document flows.

Core behaviors:

- classify the request before implementation
- preserve working behavior
- separate structure, routing, data contracts, UI, execution, audit, and verification
- validate locally when needed
- block unauthorized commit, push, sync, and deploy actions

## Walker Docs Guardrails

- primary app code lives in `Walker Docs App Folder/`
- the app is currently static HTML/CSS/JS
- print layout, form-field contracts, autofill, signatures, email drafting, and shared local state are compatibility-sensitive
- no fake completion claims; separate proven vs not proven
- if a proposed build pushes the default effect ratio, pause for explicit approval
- if a proposed change alters runtime model such as `Next.js`, PWA, service workers, or caching, require a staged migration plan first

## Agent Sequencing Rule

Default sequence for non-trivial work:

1. `Mo`
2. `Ezra`
3. `Dan` when shared data, storage, or backend rules change
4. `Gabe`
5. `Josh`
6. `Mike`
7. `Nathan`

Use `Scribe` for docs, build manifests, and package upkeep.

## Required Agent Prompt Packet

```text
Agent: <Mo|Ezra|Dan|Gabe|Josh|Mike|Nathan|Scribe>
Permission Source: agents/AGENT_PERMISSIONS_ACTIONS_ONE_SHEET.md
Role Source: agents/<agent>.agent.md
Task Type: <NEW_BUILD|SITE_OVERHAUL|MODIFICATION|REFRESH>
Goal: <stage goal>
Governing References:
- agents/AGENT_PERMISSIONS_ACTIONS_ONE_SHEET.md
- AGENTS.md
- .github/copilot-instructions.md
- <task-specific files>
Current State Evidence:
- <repo evidence>
Hard Constraints:
- local workspace first
- preserve working document flows unless the task explicitly changes them
- no commit/push/deploy without explicit authorization
- if runtime model changes, require a staged migration plan first
Required Stage Output:
- What is going on
- Why this agent owns it
- What was found
- What should happen next
Proof Rules:
- mark proven vs not proven
- cite files/checks
```

## Required Final Deliverables

After staged execution, the companion should return:

1. approved enhancement or migration plan
2. phased implementation plan
3. local validation plan
4. verification checklist
5. must-preserve behavior list
6. hold-for-approval items

## Security Handling

- never commit secrets
- prefer local env injection over hardcoding
- redact secrets in reporting
- rotate leaked secrets
