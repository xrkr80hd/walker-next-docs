"use client";

import dynamic from "next/dynamic";

const DashboardScreen = dynamic(
  () =>
    import("@/components/workflow/dashboard-screen").then(
      (module) => module.DashboardScreen,
    ),
  { ssr: false },
);

export default DashboardScreen;
