"use client";

import { createContext, useContext, useState } from "react";

const MAX_COMPARE = 3;

type ToggleResult = "added" | "removed" | "full";

type CompareApi = {
  ids: string[];
  has: (id: string) => boolean;
  toggle: (id: string) => ToggleResult;
  remove: (id: string) => void;
  clear: () => void;
};

const CompareContext = createContext<CompareApi | null>(null);

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);

  const api: CompareApi = {
    ids,
    has: (id) => ids.includes(id),
    toggle: (id) => {
      if (ids.includes(id)) {
        setIds(ids.filter((item) => item !== id));
        return "removed";
      }
      if (ids.length >= MAX_COMPARE) return "full";
      setIds([...ids, id]);
      return "added";
    },
    remove: (id) => setIds(ids.filter((item) => item !== id)),
    clear: () => setIds([]),
  };

  return <CompareContext.Provider value={api}>{children}</CompareContext.Provider>;
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error("useCompare must be used within CompareProvider");
  }
  return context;
}
