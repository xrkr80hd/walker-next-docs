import type { ReactNode } from "react";

import { SupabaseSessionGate } from "@/components/auth/supabase-session-gate";

export default function PrintLayout({ children }: { children: ReactNode }) {
  return <SupabaseSessionGate surface="print">{children}</SupabaseSessionGate>;
}
