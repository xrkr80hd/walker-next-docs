"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase-browser";

const FniQueueScreen = dynamic(
  () =>
    import("@/components/workflow/fni-queue-screen").then(
      (module) => module.FniQueueScreen,
    ),
  { ssr: false },
);

export default function FniQueuePage() {
  const [role, setRole] = useState("user");

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = getSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single()
        .then(({ data: profile }) => {
          if (profile?.role) setRole(profile.role);
        });
    });
  }, []);

  return <FniQueueScreen role={role} />;
}
