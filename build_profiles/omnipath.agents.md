# OmniPath Agent Build Profile

Profile key: `omnipath`
Engine file: `build_profiles/omnipath.engine.json`

Use this profile when the request belongs to the OmniPath world, codex, quest, faction, relic, character, spell, ritual, or magical effect system.

Canonical agent package sources:

- `agents/AGENT_PERMISSIONS_ACTIONS_ONE_SHEET.md`
- `agents/AGENTS_QUICK_REFERENCE_GUIDE.md`
- `agents/mo.agent.md`
- `agents/ezra.agent.md`
- `agents/dan.agent.md`
- `agents/gabe.agent.md`
- `agents/josh.agent.md`
- `agents/mike.agent.md`
- `agents/nathan.agent.md`

Primary build references:

- `OmniPath/docs/omnipath-foundation-plan.md`
- `OmniPath/OmniPath_VSCode_Handoff_Reset.md`

Profile rules:

- Start with `Mo` for structure, module boundaries, and MVP scope.
- Run `Ezra` before screen or feature work to keep codex, quest, and profile routes clean.
- Run `Dan` when save-state, account, admin, publishing, backend ownership, or spell/effect state contracts are in scope.
- Keep `Gabe` behind approved structure and route decisions.
- Use `Josh` to turn approved OmniPath plans into build-ready phases.
- Use `Mike` and `Nathan` as the final correction and proof pass.
- Treat magical TTRPG mechanics as first-class constraints: spell costs, effect durations, stack/dispel behavior, and relic attunement rules must stay explicit.
- UI shape language is square-first, not pill-based.
- Do not introduce pill buttons, pill tabs, pill badges, or rounded capsule shells.

Canonical naming:

- Product name: `OmniPath`
- Profile name: `omnipath`
- Do not rename it to alternate spellings inside build artifacts.
