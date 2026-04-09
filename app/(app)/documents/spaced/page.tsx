"use client";

import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";

const SpaceSheetScreen = dynamic(
  () =>
    import("@/components/documents/space-sheet-screen").then(
      (module) => module.SpaceSheetScreen,
    ),
  { ssr: false },
);

export default function SpacedPage() {
  const params = useSearchParams();
  const bypass = params.get("bypass") === "1";
  return <SpaceSheetScreen bypassMode={bypass} />;
}
