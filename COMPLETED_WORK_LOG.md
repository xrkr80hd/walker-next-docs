# Completed Work Log — Walker Docs Next

All completed phases and their build verifications live here. This is the historical record.

---

## Requested Changes (Original)

1. **Add Salesperson # to ConsultantInfo** — Move salesperson number from per-deal form into persistent consultant setup (localStorage).
2. **Remove salesperson fields from per-deal form** — Consultant name/# now come from consultant setup, not per-deal FIELD_DEFS.
3. **Kill both address category dropdowns** — Remove homeAddressCategory and mailingAddressCategory select fields entirely.
4. **Rename "Session-only deal draft"** — Replace with professional name, no jargon.
5. **Make all sections collapsible accordions** — Dealer, Consultant, and Deal sections with open/close toggles.
6. **Strip jargon/bot-speak everywhere** — Hero text, header, status messages, button labels, document descriptions, pilot notes.
7. **Make every field on every document typeable** — All blank lines across all 7 document sheets should accept typed input.

---

## Phase 2 — Consultant + Dealer Wiring

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

---

## Phase 3 — Workflow Page Overhaul

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

---

## Phase 4 — Make All Document Fields Typeable

| Document | Fields Made Editable | File | Status |
|----------|---------------------|------|--------|
| Payoff Form | 16 fieldLine spans + 4 signatureLines | `components/documents/payoff-form-sheet.tsx` | Done |
| VIN Verification | 3 inline date fields + 4 signature lines | `components/documents/vin-verification-sheet.tsx` | Done |
| Address Information | 3 blank fields (2× city/state/zip, 1× county) | `components/documents/address-information-sheet.tsx` | Done |
| Buyers Guide | 2 warranty percentage fields + 4 underlineFill fields | `components/documents/buyers-guide-sheet.tsx` | Done |
| Space Sheet | 7 priority reason lines | `components/documents/space-sheet-sheet.tsx` | Done |
| Buyers Guide Reverse | No blank fields — all static/data-bound | N/A | N/A |
| Delivery Checklist | Already typeable (pre-existing) | N/A | N/A |

### Build Verification (Phase 1-4)

- **Next.js build**: Clean — 20/20 routes compiled, zero TypeScript errors
- **Lint**: Only pre-existing inline style warnings
- **Routes**: All 18 document/print routes + /workflow + / confirmed static

---

## Phase 5 — Workflow Polish + Document Fixes

| # | Task | Status |
|---|------|--------|
| 1 | Remove redundant inner heading in Dealership card | Done |
| 2 | Add Save, Clear, Delete buttons to Dealership with save confirmation | Done |
| 3 | Rename Consultant inner label to "Salesperson Information" | Done |
| 4 | Add Save, Clear, Delete buttons to Consultant with save confirmation | Done |
| 5 | All accordion headers → red background, content area stays white | Done |
| 6 | Red accordion header for Current Deal | Done |
| 7 | All accordions closed on page load | Done |
| 8 | Remove "Check VIN + Email F&I" button | Done |
| 9 | Add "Save to PDF" button | Done |
| 10 | Keep the print button | Done |
| 11 | VIN confirmation toast before print or save-to-PDF | Done |
| 12 | Physical address always visible, Yes/No checkboxes for mailing | Done |
| 13 | Merge Buyers Guide front + reverse into one document (2 pages) | Done |
| 14 | Reverse: Defects on top, federal law notice below | Done |
| 15 | Reverse: Restructure contact info layout | Done |
| 16 | Reverse: Signature box (on hold) | N/A |
| 17 | Owner + Co-Owner Signature side by side | Done |
| 18 | Clickable signature boxes for Owner, Co-Owner, Witness | Done |
| 19 | After signing: Keep, Clear/Reset, Cancel buttons | Done |
| 20 | Printed Name = Salesperson name (auto-fill from consultant) | Done |
| 21 | VIN Verification clickable signature box pattern | Done |
| 22 | Replace "Consultant Signature" → "Salesperson" everywhere | Done |
| 23 | Add minimal doc version stamp to each document | Done |
| 24 | Space Sheet fields not typeable — fix contentEditable | Done |
| 25 | Replace Space Sheet top logo with `space-sheet-graphic.png` | Done |
| 26 | Add Trade yes/no checkboxes with balance/payment/budget fields | Done |
| 27 | Tighten Space Sheet layout to match reference | Done |
| 28 | VIN toast: universal across all print/PDF flows | Done |

### Build Verification (Phase 5)

- **Next.js build**: Clean — 20/20 routes compiled, zero TypeScript errors
- **All 27 items**: Completed (except #16 — on hold per user)

---

## Phase 6 — NEW Vehicle Workflow

**Goal:** Clone USED workflow into separate `/workflow/new` route. NEW omits Buyer's Guide.

| # | Task | Status |
|---|------|--------|
| 1 | Create `components/documents/all-new-print-screen.tsx` | Done |
| 2 | Create `app/(print)/print/all-new/page.tsx` | Done |
| 3 | Add `dealType` prop to `WorkflowScreen` (defaults to `"used"`) | Done |
| 4 | Filter document list + conditional print route based on `dealType` | Done |
| 5 | Add Used/New tab links at top of workflow screen | Done |
| 6 | Create `app/(app)/workflow/new/page.tsx` | Done |
| 7 | Build & verify zero errors, both workflows functional | Done |

### Build Verification (Phase 6)

- **Next.js build**: Clean — 28/28 routes compiled, zero TypeScript errors
- **New routes**: `/workflow/new`, `/print/all-new`
- **USED workflow**: Untouched — all 6 documents, Buyer's Guide included
- **NEW workflow**: 5 documents, Buyer's Guide excluded
- **Shared localStorage**: Both workflows use the same deal data

---

## Phase 7 — Workflow UI Cleanup

**Goal:** Clean up button placement, remove redundant buttons, wrap documents in accordion, add blank form printing.

| # | Task | Status |
|---|------|--------|
| 1 | Remove redundant Print + Save to PDF (delivery-checklist-only) buttons | Done |
| 2 | Move Save Session + New Deal inside Deal accordion | Done |
| 3 | Move status message out of Deal accordion — always visible | Done |
| 4 | Wrap Available Documents in collapsible red-header accordion | Done |
| 5 | Add `documents` key to `openSections` state + clearSession reset | Done |
| 6 | Place Print All + Save All to PDF inside Documents accordion | Done |
| 7 | Upgrade status message to full-width alert banner | Done |
| 8 | Add Print Blank + Save Blank to PDF buttons | Done |
| 9 | Add `?blank=1` support to `AllPrintScreen` and `AllNewPrintScreen` | Done |

### Build Verification (Phase 7)

- **Zero TypeScript errors** across all modified files
- **Buttons**: 4 in Documents accordion, 2 in Deal accordion
- **Status banner**: Always visible between Deal and Documents sections
- **Blank forms**: Both workflows can print/save empty templates
- **Both workflows**: `/workflow` and `/workflow/new` share all UI changes

---

## Phase 8 — Blank Print VIN Skip + Hero Layout

**Goal:** Skip VIN confirmation when printing blank forms; stack New/Used/Settings vertically and centered in hero.

| # | Task | File(s) | Status |
|---|------|---------|--------|
| 1 | Skip VIN confirmation dialog on Print Blank / Save Blank (both workflows) | `all-print-screen.tsx`, `all-new-print-screen.tsx` | Done |
| 2 | Stack New / Used / Settings vertically in hero, all same width, centered | `workflow-screen.tsx` | Done |

### Build Verification (Phase 8)

- **28/28 routes**, zero errors
- **Blank forms**: No VIN dialog on either workflow's blank print/save
- **Hero nav**: New, Used, Settings stacked vertically in centered 160px column

---

## Phase 9 — Mailing Toggle, Checkbox Cluster, Scroll Restore

**Goal:** Replace ugly Yes/No mailing checkboxes with a proper toggle, restyle Delivery Checklist + Co-owner checkboxes, fix scroll restore on Back to Workflow.

| # | Task | File(s) | Status |
|---|------|---------|--------|
| 1 | Replaced Yes/No checkboxes with iOS-style toggle switch; mailing fields always visible, greyed out/disabled when same-as-physical, active with color when different | `workflow-screen.tsx` | Done |
| 2 | Restyled Delivery Checklist + Co-owner as bordered button-style toggles with checkmark icons, side-by-side grid layout | `workflow-screen.tsx` | Done |
| 3 | Improved scroll restore with retry loop (up to 10 rAF frames) for accordion content timing | `workflow-screen.tsx` | Done |
| 4 | Added `returnPath` to view state + exported `getWorkflowReturnPath()` helper | `workflow-screen.tsx` | Done |
| 5 | Updated all 7 document screens to use `getWorkflowReturnPath()` for Back to Workflow link (fixes NEW workflow returning to USED) | `address-information-screen.tsx`, `buyers-guide-screen.tsx`, `buyers-guide-reverse-screen.tsx`, `delivery-checklist-screen.tsx`, `payoff-form-screen.tsx`, `vin-verification-screen.tsx`, `space-sheet-screen.tsx` | Done |

### Build Verification (Phase 9)

- **28/28 routes**, zero TypeScript errors
- **Mailing toggle**: Single switch, fields always visible, disabled state greyed out
- **Checkboxes**: Button-style with accent color highlight when active
- **Scroll restore**: Retry loop handles accordion render timing
- **Back to Workflow**: Returns to correct workflow (used or new) via `getWorkflowReturnPath()`

---

### Phase 10 — Dashboard Landing Page

**Goal:** Move New/Used/Settings out of workflow hero into a dedicated `/dashboard` page. Settings lives on dashboard only. Same hero styling.

| # | Task | File(s) | Status |
|---|------|---------|--------|
| 1 | Extracted settings drawer from workflow-screen into shared component | `components/workflow/settings-drawer.tsx` (NEW) | Done |
| 2 | Created dashboard screen with hero branding + New/Used/Settings buttons | `components/workflow/dashboard-screen.tsx` (NEW) | Done |
| 3 | Created dashboard route page | `app/(app)/dashboard/page.tsx` (NEW) | Done |
| 4 | Updated root redirect from `/workflow` to `/dashboard` | `app/page.tsx` | Done |
| 5 | Removed hero nav (New/Used/Settings) + settings drawer + 8 CRUD functions from workflow screen; made dealer/consultant read-only state | `workflow-screen.tsx` | Done |
| 6 | Added "Back to Dashboard" link to workflow hero | `workflow-screen.tsx` | Done |
| 7 | Updated layout header nav: "Workflow" → "Dashboard" with `/dashboard` href | `app/(app)/layout.tsx` | Done |

### Build Verification (Phase 10)

- **29/29 routes**, zero TypeScript errors (new `/dashboard` route added)
- **Flow:** `/` → `/dashboard` → pick New Vehicle or Used Vehicle → `/workflow/new` or `/workflow`
- **Settings:** Dashboard-only via `SettingsDrawer` shared component
- **Workflow hero:** "Back to Dashboard" link replaces old New/Used/Settings nav
- **Imports cleaned:** Removed `useCallback`, `createDefaultDealer`, `createDefaultConsultant`, `saveDealer`, `saveConsultant` from workflow-screen
