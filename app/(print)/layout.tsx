import type { ReactNode } from "react";

import { DisclosureGate } from "@/components/auth/disclosure-gate";
import { SupabaseSessionGate } from "@/components/auth/supabase-session-gate";

export default function PrintLayout({ children }: { children: ReactNode }) {
  return (
    <SupabaseSessionGate surface="print">
      <DisclosureGate>{children}</DisclosureGate>
    </SupabaseSessionGate>
  );
}
