import { makePage } from "@keystatic/astro/ui";
import keystaticConfig from "../../../keystatic.config";
import { createSaveStateMachine } from "@lib/save-pipeline/state-machine";
import { StatusPill } from "./StatusPill";
import { RecoveryBanner } from "./RecoveryBanner";
import { MobileTip } from "./MobileTip";
import { HelpModal } from "./HelpModal";

const stateMachine = createSaveStateMachine();
const AdminUI = makePage(keystaticConfig);
const helpUrl = import.meta.env.PUBLIC_KEYSTATIC_HELP_URL as string | undefined;

export function AdminShell() {
  return (
    <div className="relative min-h-screen">
      <div className="fixed right-2 top-2 z-50 flex items-center gap-2">
        <HelpModal notionGuideUrl={helpUrl} />
        <StatusPill stateMachine={stateMachine} />
      </div>
      <div className="px-4 pt-12">
        <MobileTip />
        <RecoveryBanner onPublish={async () => {}} />
      </div>
      <AdminUI />
    </div>
  );
}
