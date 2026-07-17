"use client";

import { AwakeContent } from "../components/AwakeContent";
import { ScreenShell } from "../components/ScreenShell";
import { SleepingContent } from "../components/SleepingContent";
import { WakingContent } from "../components/WakingContent";
import { useSteward } from "../features/steward/useSteward";

export default function Home() {
  const steward = useSteward();

  return (
    <ScreenShell>
      {steward.lifeState === "sleeping" ? (
        <SleepingContent onWake={steward.startWaking} />
      ) : null}
      {steward.lifeState === "waking" ? (
        <WakingContent
          state={steward.state}
          onComplete={steward.completeWaking}
        />
      ) : null}
      {steward.lifeState === "awake" ? (
        <AwakeContent state={steward.state} onSleep={steward.resetToSleeping} />
      ) : null}
    </ScreenShell>
  );
}
