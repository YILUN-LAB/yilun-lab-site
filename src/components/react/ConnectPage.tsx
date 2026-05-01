import { useState } from "react";
import { motion } from "motion/react";
import { useGlassLensing } from "@lib/glass-lensing";
import { easeOut } from "@lib/motion-presets";
import { AuroraBackground } from "./AuroraBackground";
import { ConnectCard } from "./ConnectCard";

export function ConnectPage() {
  useGlassLensing();
  const [pulseKey, setPulseKey] = useState(0);

  return (
    <div data-page="connect" className="relative min-h-dvh">
      <AuroraBackground />
      <CatchLightPulse pulseKey={pulseKey} />
      <main className="relative z-10 flex min-h-dvh items-center justify-center px-6 py-16">
        <ConnectCard onFlipStart={() => setPulseKey((k) => k + 1)} />
      </main>
    </div>
  );
}

function CatchLightPulse({ pulseKey }: { pulseKey: number }) {
  // No flash on initial paint — pulseKey starts at 0.
  if (pulseKey === 0) return null;
  return (
    <motion.div
      key={pulseKey}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0"
      style={{
        zIndex: 0,
        background:
          "radial-gradient(60% 60% at 50% 50%, rgba(245,175,60,0.5), transparent 65%)",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 0.35, 0] }}
      transition={{ duration: 0.8, times: [0, 0.5, 1], ease: easeOut }}
    />
  );
}
