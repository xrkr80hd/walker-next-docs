"use client";

import dynamic from "next/dynamic";

const OverviewScreen = dynamic(
  () =>
    import("@/components/workflow/overview-screen").then(
      (module) => module.OverviewScreen,
    ),
  { ssr: false },
);

export default OverviewScreen;
