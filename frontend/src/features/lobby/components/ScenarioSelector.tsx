import { useEffect, useRef } from "react";
import { useState } from "react";
import { ScenarioDefinition } from "@/domain/game.types";
import { emitters } from "@/services/socket/socketEmitters";

interface Props {
  scenarios: ScenarioDefinition[];
  selectedId: string;
  disabled: boolean;
}

export function ScenarioSelector({ scenarios, selectedId, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selected = scenarios.find((s) => s.scenarioId === selectedId);

  // Close when clicking outside
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  function handleSelect(id: string) {
    emitters.selectScenario(id);
    setOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpen((o) => !o); }
    if (e.key === "Escape") setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative w-full">
      {/* ── Trigger ── */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "11px 16px",
          background: "rgba(7, 4, 18, 0.88)",
          border: "1px solid rgba(143,106,47,0.5)",
          borderBottom: open ? "1px solid rgba(143,106,47,0.2)" : "1px solid rgba(143,106,47,0.5)",
          borderRadius: open ? "10px 10px 0 0" : "10px",
          color: "#f4e6bf",
          fontSize: "14px",
          fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.55 : 1,
          transition: "border-color 0.2s",
        }}
      >
        <span style={{ fontWeight: 500 }}>{selected?.name ?? "Select a scenario…"}</span>
        <ChevronIcon rotated={open} />
      </button>

      {/* ── Dropdown list ── */}
      {open && (
        <ul
          role="listbox"
          aria-label="Scenario"
          style={{
            position: "relative",
            width: "100%",
            zIndex: 200,
            margin: 0,
            padding: "4px 0",
            listStyle: "none",
            background: "rgba(9, 6, 22, 0.99)",
            border: "1px solid rgba(143,106,47,0.5)",
            borderTop: "none",
            borderRadius: "0 0 10px 10px",
            boxShadow: "0 18px 48px rgba(0,0,0,0.65)",
            maxHeight: "min(190px, 28vh)",
            overflowY: "auto",
            overscrollBehavior: "contain",
          }}
        >
          {scenarios.map((s) => (
            <ScenarioOption
              key={s.scenarioId}
              name={s.name}
              selected={s.scenarioId === selectedId}
              onSelect={() => handleSelect(s.scenarioId)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

/* ── Sub-components ───────────────────────────────────────────── */

function ScenarioOption({
  name,
  selected,
  onSelect,
}: {
  name: string;
  selected: boolean;
  onSelect: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <li
      role="option"
      aria-selected={selected}
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "11px 16px",
        cursor: "pointer",
        fontSize: "14px",
        fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
        fontWeight: selected ? 600 : 400,
        color: selected ? "#f2c14e" : hovered ? "#f4e6bf" : "#cfc8bd",
        background: selected
          ? "rgba(139,62,198,0.28)"
          : hovered
          ? "rgba(139,62,198,0.12)"
          : "transparent",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
        transition: "background 0.12s, color 0.12s",
        userSelect: "none",
      }}
    >
      <span>{name}</span>
      {selected && (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f2c14e" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
    </li>
  );
}

function ChevronIcon({ rotated }: { rotated: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#f2c14e"
      strokeWidth={2.5}
      style={{
        flexShrink: 0,
        transition: "transform 0.2s",
        transform: rotated ? "rotate(180deg)" : "rotate(0deg)",
      }}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}
