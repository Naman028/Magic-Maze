import { useEffect, useRef, useState } from "react";
import { DifficultyLevel } from "@/domain/game.types";
import { emitters } from "@/services/socket/socketEmitters";

const OPTIONS: { value: DifficultyLevel; label: string; time: string }[] = [
  { value: "Easy",   label: "Easy",   time: "04:00" },
  { value: "Normal", label: "Normal", time: "03:00" },
  { value: "Hard",   label: "Hard",   time: "02:00" },
];

interface Props { value: DifficultyLevel; disabled: boolean; }

export function DifficultySelector({ value, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = OPTIONS.find((o) => o.value === value) ?? OPTIONS[0];

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  function pick(v: DifficultyLevel) {
    emitters.selectDifficulty(v);
    setOpen(false);
  }

  const base: React.CSSProperties = {
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
    fontSize: "14px",
    border: "1px solid rgba(143,106,47,0.5)",
    background: "rgba(7,4,18,0.88)",
    color: "#f4e6bf",
  };

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpen((o) => !o); }
          if (e.key === "Escape") setOpen(false);
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
        style={{
          ...base,
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          padding: "11px 16px",
          borderBottom: open ? "1px solid rgba(143,106,47,0.2)" : base.border,
          borderRadius: open ? "10px 10px 0 0" : "10px",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.55 : 1,
          transition: "border-color 0.2s",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <ClockIcon />
          <span style={{ fontWeight: 500 }}>{current.label}</span>
          <span style={{ color: "#a89e94", fontSize: 12 }}>· {current.time}</span>
        </span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f2c14e" strokeWidth={2.5}
          style={{ flexShrink: 0, transition: "transform .2s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <ul role="listbox" style={{
          position: "relative", width: "100%", zIndex: 200,
          margin: 0, padding: "4px 0", listStyle: "none",
          background: "rgba(9,6,22,0.99)",
          border: "1px solid rgba(143,106,47,0.5)", borderTop: "none",
          borderRadius: "0 0 10px 10px",
          boxShadow: "0 18px 48px rgba(0,0,0,0.65)", maxHeight: "min(145px, 22vh)", overflowY: "auto", overscrollBehavior: "contain",
        }}>
          {OPTIONS.map((opt) => (
            <DifficultyOption key={opt.value} opt={opt} selected={opt.value === value} onSelect={() => pick(opt.value)} />
          ))}
        </ul>
      )}
    </div>
  );
}

function DifficultyOption({
  opt, selected, onSelect,
}: {
  opt: { value: DifficultyLevel; label: string; time: string };
  selected: boolean;
  onSelect: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <li role="option" aria-selected={selected} onClick={onSelect}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "11px 16px", cursor: "pointer",
        fontSize: "14px", fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
        fontWeight: selected ? 600 : 400,
        color: selected ? "#f2c14e" : hovered ? "#f4e6bf" : "#cfc8bd",
        background: selected ? "rgba(139,62,198,0.28)" : hovered ? "rgba(139,62,198,0.12)" : "transparent",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
        transition: "background 0.12s, color 0.12s",
        userSelect: "none",
      }}
    >
      <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span>{opt.label}</span>
        <span style={{ fontSize: 12, color: selected ? "rgba(242,193,78,0.7)" : "#a89e94" }}>· {opt.time}</span>
      </span>
      {selected && (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f2c14e" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
    </li>
  );
}

function ClockIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#a89e94" strokeWidth={2}>
      <circle cx="12" cy="12" r="10" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
    </svg>
  );
}
