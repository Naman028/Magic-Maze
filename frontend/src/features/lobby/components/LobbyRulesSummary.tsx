import { useState } from "react";
import { ScenarioDefinition } from "@/domain/game.types";
import { getRulesForScenario, ScenarioRule } from "../data/scenarioRules";
import { RulesModal } from "./RulesModal";

interface Props { scenario: ScenarioDefinition; }

export function LobbyRulesSummary({ scenario }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const rules = getRulesForScenario(scenario.name);

  // Fall back to deriving rules from scenario properties if name not in static map
  const displayRules: ScenarioRule[] = rules ?? [
    { icon: "💬", title: "Communication", desc: scenario.communicationAlwaysOpen ? "Open communication throughout." : "Silent gameplay — voice windows only." },
    { icon: "🚪", title: "Exit Rule",      desc: scenario.matchingExitsRequired ? "Heroes escape through matching exits." : "All heroes use the single purple exit." },
    { icon: "⏳", title: "Timer",          desc: `${Math.floor(scenario.timeLimitSeconds / 60)}:${String(scenario.timeLimitSeconds % 60).padStart(2, "0")} to escape.` },
    { icon: "📖", title: "Scenario",       desc: scenario.description || "Complete all objectives." },
  ];

  return (
    <section style={{
      background: "linear-gradient(180deg, rgba(18,10,28,0.97), rgba(10,7,18,0.99))",
      border: "1px solid rgba(143,106,47,0.48)",
      borderRadius: 18,
      overflow: "hidden",
      boxShadow: "0 0 0 1px rgba(255,255,255,0.025), 0 20px 48px rgba(0,0,0,0.4)",
    }}>
      {/* Card header */}
      <CardHeader label="Rules Preview" />

      {/* Rules list */}
      <ul style={{ margin: 0, padding: "6px 0 4px", listStyle: "none" }}>
        {displayRules.map((rule) => (
          <RuleItem key={rule.title} rule={rule} />
        ))}
      </ul>

      {/* Rules change note */}
      {rules == null && (
        <p style={{
          margin: "0 16px 10px",
          fontSize: 11,
          color: "#a89e94",
          fontStyle: "italic",
          fontFamily: "Inter, ui-sans-serif, sans-serif",
        }}>
          ⓘ Rules change with each scenario.
        </p>
      )}

      {/* View All Rules button */}
      <div style={{ padding: "10px 16px 16px" }}>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "10px 16px",
            background: "rgba(139,62,198,0.08)",
            border: "1px solid rgba(139,62,198,0.38)",
            borderRadius: 10,
            color: "#c084fc",
            fontSize: 12,
            fontWeight: 600,
            fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
            letterSpacing: "0.04em",
            cursor: "pointer",
            transition: "background 0.2s, border-color 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(139,62,198,0.18)";
            e.currentTarget.style.borderColor = "rgba(139,62,198,0.65)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(139,62,198,0.08)";
            e.currentTarget.style.borderColor = "rgba(139,62,198,0.38)";
          }}
        >
          <BookIcon />
          View All Rules
        </button>
      </div>

      {/* Rules modal — rendered via portal so it overlays the full screen */}
      {modalOpen && <RulesModal scenario={scenario} onClose={() => setModalOpen(false)} />}
    </section>
  );
}

/* ── Shared card header (also used by RoomCodeCard) ─────────── */
export function CardHeader({ label }: { label: string }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "16px 20px 12px",
      borderBottom: "1px solid rgba(143,106,47,0.18)",
    }}>
      <div style={{ flex: 1, height: 1, background: "linear-gradient(to right, transparent, rgba(143,106,47,0.45))" }} />
      <span style={{ color: "#f2c14e", fontSize: 10 }}>◆</span>
      <span style={{
        color: "#f2c14e",
        fontSize: 11,
        fontWeight: 800,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
        whiteSpace: "nowrap",
      }}>
        {label}
      </span>
      <span style={{ color: "#f2c14e", fontSize: 10 }}>◆</span>
      <div style={{ flex: 1, height: 1, background: "linear-gradient(to left, transparent, rgba(143,106,47,0.45))" }} />
    </div>
  );
}

/* ── Rule list item ──────────────────────────────────────────── */
function RuleItem({ rule }: { rule: ScenarioRule }) {
  return (
    <li style={{
      display: "flex",
      alignItems: "flex-start",
      gap: 10,
      padding: "9px 16px",
    }}>
      <span style={{
        fontSize: 18,
        lineHeight: 1,
        flexShrink: 0,
        marginTop: 1,
        filter: "drop-shadow(0 0 4px rgba(192,132,252,0.3))",
      }}>
        {rule.icon}
      </span>
      <div>
        <strong style={{
          display: "block",
          color: "#f0e0c0",
          fontSize: 12,
          fontWeight: 700,
          fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
          letterSpacing: "0.03em",
        }}>
          {rule.title}
        </strong>
        <span style={{
          display: "block",
          color: "#a89e94",
          fontSize: 11,
          fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
          lineHeight: 1.4,
          marginTop: 1,
        }}>
          {rule.desc}
        </span>
      </div>
    </li>
  );
}

function BookIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 19.5A2.5 2.5 0 016.5 17H20" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
    </svg>
  );
}
