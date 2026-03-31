## Walker Docs

Walker Docs is the Next.js migration target for the Walker dealership document workflow. It is being rebuilt as a tablet and phone-first internal app while preserving the local-first workflow and exact print behavior from the legacy static version.

## Current Scope

- Shared deal intake at `/workflow`
- Document library at `/documents`
- First migrated document at `/documents/delivery-checklist`
- Dedicated exact-print surface at `/print/delivery-checklist`
- Shared local storage contract in `lib/walker-workflow.ts`

## Development

Run the app locally:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Quality checks:

```bash
npm run lint
npm run build
```

Docker Compose files are included:

```bash
npm run docker:up
npm run docker:down
```

## Project Notes

- The legacy static Walker Docs app remains the reference baseline.
- Print parity is the critical constraint. Screen layout work must not corrupt letter-size output.
- Customer/co-customer support is in progress and should replace single-name assumptions as forms are ported.

## Next Steps

- Port the next workflow-critical forms behind the same shared data contract
- Finish customer/co-customer corrections
- Lock down printer validation before PWA/offline work
