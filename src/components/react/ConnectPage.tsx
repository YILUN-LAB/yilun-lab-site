import { useGlassLensing } from "@lib/glass-lensing";
import { AuroraBackground } from "./AuroraBackground";
import { ConnectCard } from "./ConnectCard";

export function ConnectPage() {
  useGlassLensing();

  return (
    <div data-page="connect" className="relative min-h-dvh">
      <AuroraBackground />
      <main className="relative z-10 flex min-h-dvh items-center justify-center px-6 py-16">
        <ConnectCard />
      </main>
    </div>
  );
}
