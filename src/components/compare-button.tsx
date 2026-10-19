"use client";

import { useState } from "react";
import { useCompare } from "@/components/compare-context";

export function CompareButton({ id, compact = false }: { id: string; compact?: boolean }) {
  const { has, toggle, ids } = useCompare();
  const selected = has(id);
  const [noticeCount, setNoticeCount] = useState<number | null>(null);
  const showNotice = noticeCount === ids.length && !selected;

  return (
    <div>
      <button
        type="button"
        aria-pressed={selected}
        onClick={() => {
          const outcome = toggle(id);
          setNoticeCount(outcome === "full" ? ids.length : null);
        }}
        className={`rounded-md border px-3 py-2 text-sm ${
          selected
            ? "border-forest bg-canopy text-forest"
            : "border-line bg-card text-ink hover:border-forest"
        }`}
      >
        {selected ? (compact ? "Added" : "In comparison") : compact ? "Compare" : "Add to comparison"}
      </button>
      {showNotice ? (
        <p className="mt-2 text-xs leading-5 text-down">
          Comparison already has three listings. Remove one to add this.
        </p>
      ) : null}
    </div>
  );
}
