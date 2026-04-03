# Workflow Screen Restructure — In Progress

## Goal

Restructure `components/workflow/workflow-screen.tsx` so the **Deal section** is the primary focus at the top, and **Dealership + Salesperson** move into a **Settings drawer** (slide-out panel).

## Current Layout (before changes)

1. Hero banner (Walker logo, "Deal Workflow", Last 8 VIN)
2. **Dealership** section (collapsible accordion, red header)
3. **Salesperson** section (collapsible accordion, red header)
4. **Current Deal** section (collapsible accordion — customer fields, addresses, vehicle, checklist, action buttons, documents list)

## Target Layout (after changes)

1. Hero banner — with a **Settings gear button** added
2. **Current Deal** section — moved to top, open by default, most-used section
3. **Settings drawer** — slide-out panel from right, contains:
   - Dealership form (same fields: name, street, city, state, zip + save/clear/delete)
   - Salesperson form (same fields: name, number, phone, email + save/clear/delete)

## What's Already Done

- [x] Added `useCallback` to imports
- [x] Added `settingsOpen` state boolean + `closeSettings` callback
- [x] Added Settings gear button to hero banner
- [x] Moved Current Deal section JSX right after hero
- [x] Replaced standalone Dealer/Salesperson accordion sections with a Settings drawer overlay
- [x] Drawer slides in from the right, has backdrop overlay, closes on backdrop click or X button
- [x] Dealer and Salesperson forms live inside the drawer (same fields, same save/clear/delete buttons)
- [x] Verified no compile errors

## RESTRUCTURE COMPLETE

## Key Constraints

- **All persistence must remain intact** — localStorage for dealer/consultant, sessionStorage for deal data
- `openSections` state stays for deal accordion; dealer/consultant accordions move inside the drawer
- All existing functions are unchanged: `updateDealer`, `updateConsultant`, `saveDealerNow`, `clearDealerNow`, `deleteDealerNow`, `saveConsultantNow`, `clearConsultantNow`, `deleteConsultantNow`
- The drawer uses new state: `settingsOpen` / `setSettingsOpen` / `closeSettings`

## File Details

- **File:** `components/workflow/workflow-screen.tsx`
- **Total lines:** ~1012
- **Return JSX starts:** line ~462
- **Hero section:** lines ~463–493
- **Old Dealer section:** lines ~495–590 (moving into drawer)
- **Old Salesperson section:** lines ~592–670 (moving into drawer)
- **Current Deal section:** lines ~672–1006 (moving up to right after hero)
- **Component close:** lines ~1007–1012
