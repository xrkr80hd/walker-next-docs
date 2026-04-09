"use client";

import dynamic from "next/dynamic";

const FnaQueueScreen = dynamic(
  () =>
    import("@/components/workflow/fna-queue-screen").then(
      (module) => module.FnaQueueScreen,
    ),
  { ssr: false },
);

export default FnaQueueScreen;
