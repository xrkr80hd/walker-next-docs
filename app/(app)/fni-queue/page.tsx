"use client";

import dynamic from "next/dynamic";

const FniQueueScreen = dynamic(
  () =>
    import("@/components/workflow/fni-queue-screen").then(
      (module) => module.FniQueueScreen,
    ),
  { ssr: false },
);

export default FniQueueScreen;
