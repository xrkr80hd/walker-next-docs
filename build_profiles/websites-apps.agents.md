# Websites and Apps Agent Build Profile

Profile key: `websites-apps`
Engine file: `build_profiles/websites-apps.engine.json`

Use this profile for the website and app stack: public sites, member apps, admin tools, commerce-capable sites, and church platform builds such as YourLocal, MyWildRoseDesigns, Wild Rose, and GoLibertyChurch.

Canonical agent package sources:

- `agents/AGENT_PERMISSIONS_ACTIONS_ONE_SHEET.md`
- `agents/AGENTS_QUICK_REFERENCE_GUIDE.md`
- `MASTER_TEMPLATE.md`
- `agents/mo.agent.md`
- `agents/ezra.agent.md`
- `agents/dan.agent.md`
- `agents/gabe.agent.md`
- `agents/josh.agent.md`
- `agents/mike.agent.md`
- `agents/nathan.agent.md`

Profile rules:

- Treat website and app work as a system when auth, roles, admin, content workflows, or member access are involved.
- Keep public website routes and member app routes separate even when they share a backend.
- Use `Dan` by default for this profile because shared data, roles, and ownership are core to the stack.
- Use `Josh` after structure, routing, and schema are clear enough to build without churn.
- End with `Mike` and `Nathan` so scope drift and unproven claims get caught before rollout.
- UI shape language is square-first, not pill-based.
- Do not introduce pill buttons, pill nav items, pill tags, or capsule-shaped shells.

Canonical naming:

- Profile name: `websites-apps`
- Destination umbrella label: `Websites_Apps`
- Preserve project names inside that umbrella: `YourLocal`, `MyWildRoseDesigns`, `WildRose_Site`, `GoLibertyChurch_App`
