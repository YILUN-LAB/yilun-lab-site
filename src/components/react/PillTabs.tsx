import { MorphPill, type MorphPillItem } from "./MorphPill";

export interface PillTab {
  id: string;
  label: string;
  badge?: string | number;
}

interface PillTabsProps {
  tabs: PillTab[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
  mobileGrid?: boolean;
}

export function PillTabs({
  tabs,
  activeId,
  onChange,
  className = "",
  mobileGrid = false,
}: PillTabsProps) {
  return (
    <MorphPill
      items={tabs as MorphPillItem[]}
      activeId={activeId}
      onChange={onChange}
      className={className}
      mobileGrid={mobileGrid}
    />
  );
}
