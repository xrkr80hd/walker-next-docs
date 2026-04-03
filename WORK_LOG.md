# Work Log — Walker Docs Next

## Requested Changes

1. **Add Salesperson # to ConsultantInfo** — Move salesperson number from per-deal form into persistent consultant setup (localStorage).
2. **Remove salesperson fields from per-deal form** — Consultant name/# now come from consultant setup, not per-deal FIELD_DEFS.
3. **Kill both address category dropdowns** — Remove homeAddressCategory and mailingAddressCategory select fields entirely.
4. **Rename "Session-only deal draft"** — Replace with professional name, no jargon.
5. **Make all sections collapsible accordions** — Dealer, Consultant, and Deal sections with open/close toggles.
6. **Strip jargon/bot-speak everywhere** — Hero text, header, status messages, button labels, document descriptions, pilot notes.
7. **Make every field on every document typeable** — All blank lines across all 7 document sheets should accept typed input.

---

## Completed Work

### Phase 2 — Consultant + Dealer Wiring

| Task | File(s) | Status |
|------|---------|--------|
| Added `salespersonNumber` to `ConsultantInfo` type, defaults, normalization | `lib/dealer-consultant.ts` | Done |
| Added Salesperson # input to Consultant Setup section | `components/workflow/workflow-screen.tsx` | Done |
| Removed `salespersonName`, `salespersonNumber` from FIELD_DEFS | `components/workflow/workflow-screen.tsx` | Done |
| Removed `homeAddressCategory`, `mailingAddressCategory` from FIELD_DEFS | `components/workflow/workflow-screen.tsx` | Done |
| Removed Mailing Address Category select from mailing toggle accordion | `components/workflow/workflow-screen.tsx` | Done |
| Removed dead `select` rendering branch (no select fields remain) | `components/workflow/workflow-screen.tsx` | Done |
| Added `consultant` prop to `DeliveryChecklistSheet` | `components/documents/delivery-checklist-sheet.tsx` | Done |
| Salesperson fields read from `consultant` with `workflow` fallback | `components/documents/delivery-checklist-sheet.tsx` | Done |
| Passed consultant to delivery checklist screen component | `components/documents/delivery-checklist-screen.tsx` | Done |
| Passed consultant to delivery checklist print screen component | `components/documents/delivery-checklist-print-screen.tsx` | Done |
| Updated `createEmailDraft` to accept optional `salespersonName` param | `lib/walker-workflow.ts` | Done |
| Both email draft callers now pass `consultant.name` | `workflow-screen.tsx`, `delivery-checklist-screen.tsx` | Done |

### Phase 3 — Workflow Page Overhaul

| Task | File(s) | Status |
|------|---------|--------|
| Renamed "Session-only deal draft" → "Current Deal" under "Deal Information" | `components/workflow/workflow-screen.tsx` | Done |
| Hero: "Intake First" → "Walker Docs", "Enter once…" → "Deal Workflow" | `components/workflow/workflow-screen.tsx` | Done |
| Header: "Docs App Migration" → "Walker Docs", "Next.js Pilot" → "Beta" | `app/(app)/layout.tsx` | Done |
| Badges: removed "Auto-clear after print", renamed others | `components/workflow/workflow-screen.tsx` | Done |
| Dealer section: "First-Time Dealer Registration" → "Dealership" | `components/workflow/workflow-screen.tsx` | Done |
| Consultant section: "Consultant Setup" → "Consultant" | `components/workflow/workflow-screen.tsx` | Done |
| Status messages: simplified all save/clear/print/email messages | `components/workflow/workflow-screen.tsx` | Done |
| Document descriptions: replaced dev-speak with plain descriptions | `lib/walker-workflow.ts` | Done |
| "Pilot Notes" → "Notes" with clean copy | `components/workflow/workflow-screen.tsx` | Done |
| "Route Map / Current migration status" → "Documents / Available Documents" | `components/workflow/workflow-screen.tsx` | Done |
| "Clear Session" button → "New Deal" | `components/workflow/workflow-screen.tsx` | Done |
| Delivery checklist screen status messages cleaned | `components/documents/delivery-checklist-screen.tsx` | Done |
| Built collapsible accordion for Dealer section (chevron toggle, summary) | `components/workflow/workflow-screen.tsx` | Done |
| Built collapsible accordion for Consultant section | `components/workflow/workflow-screen.tsx` | Done |
| Built collapsible accordion for Deal section (with Last 8 badge) | `components/workflow/workflow-screen.tsx` | Done |
| Added `openSections` state + `toggleSection` helper | `components/workflow/workflow-screen.tsx` | Done |

### Phase 4 — Make All Document Fields Typeable

| Document | Fields Made Editable | File | Status |
|----------|---------------------|------|--------|
| Payoff Form | 16 fieldLine spans + 4 signatureLines (lienholder, phone, address, payoffs, account #, per diem, SSN, representative, date, verified by, accounting fields, all signatures) | `components/documents/payoff-form-sheet.tsx` | Done |
| VIN Verification | 3 inline date fields (day, month, year) + 4 signature lines (customer sig, customer printed name, consultant sig) | `components/documents/vin-verification-sheet.tsx` | Done |
| Address Information | 3 blank fields (2× city/state/zip, 1× county) | `components/documents/address-information-sheet.tsx` | Done |
| Buyers Guide | 2 warranty percentage fields + 4 underlineFill fields (systems covered, duration) | `components/documents/buyers-guide-sheet.tsx` | Done |
| Space Sheet | 7 priority reason lines (one per priority item) | `components/documents/space-sheet-sheet.tsx` | Done |
| Buyers Guide Reverse | No blank fields — all content is static regulatory text or already data-bound | N/A | N/A |
| Delivery Checklist | Already typeable via EditableLine component (pre-existing) | N/A | N/A |

All editable fields use `contentEditable` with `suppressContentEditableWarning` and a `blockEnter` handler to enforce single-line input.

---

## Build Verification (Phase 1-4)

- **Next.js build**: Clean — 20/20 routes compiled, zero TypeScript errors
- **Lint**: Only pre-existing inline style warnings (ResizeObserver scaling on screen components)
- **Routes**: All 18 document/print routes + /workflow + / confirmed static

---

## Phase 5 — Current Task List

### Workflow Page — Dealership Card

| # | Task | Status |
|---|------|--------|
| 1 | Remove redundant inner heading — rename to something distinct (not "Dealership Information" under "Dealership") | Done |
| 2 | Add Save, Clear, Delete buttons with save confirmation | Done |

### Workflow Page — Consultant Card

| # | Task | Status |
|---|------|--------|
| 3 | Rename inner label to "Salesperson Information" | Done |
| 4 | Add Save, Clear, Delete buttons with save confirmation | Done |

### Workflow Page — Accordion Styling

| # | Task | Status |
|---|------|--------|
| 5 | All accordion headers → red background, content area stays white | Done |

### Workflow Page — Current Deal

| # | Task | Status |
|---|------|--------|
| 6 | Red accordion header. Opens to show document list (accordion behavior) | Done |

### Workflow Page — Accordions Default State

| # | Task | Status |
|---|------|--------|
| 7 | All accordions closed on page load, every time | Done |

### Workflow Page — Buttons

| # | Task | Status |
|---|------|--------|
| 8 | Remove "Check VIN + Email F&I" button entirely | Done |
| 9 | Add "Save to PDF" / "Export to PDF" button | Done |
| 10 | Keep the print button | Done |

### Workflow Page — VIN Toast

| # | Task | Status |
|---|------|--------|
| 11 | Bring back VIN confirmation toast before print or save-to-PDF | Done |

### Workflow Page — Mailing Address

| # | Task | Status |
|---|------|--------|
| 12 | Physical address always visible. Yes/No checkboxes for "same as physical". No → mailing fields appear | Done |

### Buyers Guide

| # | Task | Status |
|---|------|--------|
| 13 | Merge front + reverse into one document, prints as 2 pages | Done |
| 14 | Reverse: Defects on top, federal law "IMPORTANT" notice below (swap order) | Done |
| 15 | Reverse: Restructure contact info — headings above underlines, data on lines | Done |
| 16 | Reverse: No signature box (on hold / not needed) | N/A |

### Payoff Form — Signatures

| # | Task | Status |
|---|------|--------|
| 17 | Owner Signature + Co-Owner Signature side by side (always visible) | Done |
| 18 | Clickable signature boxes for Owner, Co-Owner, Witness — click to sign | Done |
| 19 | After signing: Keep, Clear/Reset, Cancel buttons | Done |

### VIN Verification Form

| # | Task | Status |
|---|------|--------|
| 20 | Printed Name = Salesperson name (auto-fill from consultant) | Done |
| 21 | Same clickable signature box pattern (click → sign → Keep / Clear / Cancel) | Done |

### All Printed Forms

| # | Task | Status |
|---|------|--------|
| 22 | Replace "Consultant Signature" → "Salesperson" everywhere | Done |

### Document Versioning

| # | Task | Status |
|---|------|--------|
| 23 | Add minimal doc version stamp to each document for revision tracking | Done |

### Space Sheet Fix

| # | Task | Status |
|---|------|--------|
| 24 | Space Sheet fields not typeable / writable — fix contentEditable on all fields | Done |

### Space Sheet Redesign

| # | Task | Status |
|---|------|--------|
| 25 | Replace top logo with `public/space-sheet-graphic.png` | Done |
| 26 | Add Trade yes/no checkboxes with Approximate Balance, Current Payment, New Budget fields | Done |
| 27 | Tighten layout to match reference: Customer Name / Address / Email / Cell Phone / Vehicle of Interest / How'd you hear about us — all with aligned underline fields | Done |

---

## Build Verification (Phase 5)

- **Next.js build**: Clean — 20/20 routes compiled, zero TypeScript errors
- **All 27 items**: Completed (except #16 — on hold per user)

---

### Phase 5 — Additional Fixes

| # | Task | Status |
|---|------|--------|
| 28 | VIN toast: no VIN → "Please enter your VIN" (blocks action). VIN present → "Verify VIN" with VIN displayed for confirmation. Universal across all print/PDF flows. | Done |
