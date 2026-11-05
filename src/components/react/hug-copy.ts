import { createContext, useContext } from "react";
import { hug, type HugCopy } from "@lib/data/hug";

/** The language of the Hug page. HugProject provides it; English is the default. */
const HugCopyContext = createContext<HugCopy>(hug);

export const HugCopyProvider = HugCopyContext.Provider;

export function useHugCopy(): HugCopy {
  return useContext(HugCopyContext);
}
