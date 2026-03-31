"use client";

import dynamic from "next/dynamic";

const WorkflowScreen = dynamic(
  () =>
    import("@/components/workflow/workflow-screen").then(
      (module) => module.WorkflowScreen,
    ),
  { ssr: false },
);

export default WorkflowScreen;
