import { useEffect } from "react";
import { ScenarioDefinition } from "@/domain/game.types";
import { getFullRulesForScenario } from "../data/scenarioRules";

interface Props {
  scenario: ScenarioDefinition;
  onClose: () => void;
}

export function RulesModal({ scenario, onClose }: Props) {
  const rules = getFullRulesForScenario(scenario.name);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // Prevent body scroll while modal is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  return (
    /* ── Backdrop ── */
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(4, 2, 10, 0.82)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
      }}
    >
      {/* ── Modal card ── */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(680px, 100%)",
          maxHeight: "calc(100vh - 48px)",
          overflowY: "auto",
          background: "linear-gradient(170deg, rgba(18,10,30,0.99), rgba(9,6,18,1))",
          border: "1px solid rgba(192,148,52,0.6)",
          borderRadius: 22,
          boxShadow:
            "0 0 0 1px rgba(192,132,252,0.12), 0 0 60px rgba(101,44,160,0.22), 0 32px 80px rgba(0,0,0,0.7)",
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(143,106,47,0.4) transparent",
        }}
      >
        {/* ── Sticky header ── */}
        <div style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "rgba(14, 8, 24, 0.98)",
          backdropFilter: "blur(8px)",
          borderBottom: "1px solid rgba(143,106,47,0.28)",
          padding: "20px 24px 16px",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
        }}>
          <div>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 4,
            }}>
              <span style={{ color: "#f2c14e", fontSize: 11 }}>◆</span>
              <span style={{
                color: "#a89e94",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
              }}>
                Full Rules
              </span>
            </div>
            <h2 style={{
              margin: 0,
              fontFamily: "Georgia, 'Palatino Linotype', serif",
              fontSize: 24,
              fontWeight: 900,
              color: "#f4e6bf",
              lineHeight: 1.2,
              textShadow: "0 0 20px rgba(242,193,78,0.25)",
            }}>
              {scenario.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close rules"
            style={{
              flexShrink: 0,
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(143,106,47,0.35)",
              borderRadius: "50%",
              color: "#a89e94",
              cursor: "pointer",
              fontSize: 16,
              transition: "background 0.15s, color 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.12)";
              e.currentTarget.style.color = "#f4e6bf";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.06)";
              e.currentTarget.style.color = "#a89e94";
            }}
          >
            ✕
          </button>
        </div>

        {/* ── Body ── */}
        <div style={{ padding: "20px 24px 28px", display: "flex", flexDirection: "column", gap: 20 }}>

          {rules ? (
            <>
              {/* Overview */}
              <p style={{
                margin: 0,
                fontSize: 14,
                lineHeight: 1.65,
                color: "#d8cfc4",
                fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
                padding: "14px 16px",
                background: "rgba(139,62,198,0.07)",
                border: "1px solid rgba(139,62,198,0.2)",
                borderRadius: 12,
              }}>
                {rules.overview}
              </p>

              {/* Quick stats row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <StatBadge icon="⏳" label="Timer" value={rules.timer} />
                <StatBadge icon="🏆" label="Win Condition" value={rules.winCondition} />
                <StatBadge icon="💬" label="Communication" value={rules.communication} span2={false} />
              </div>

              {/* Rule sections */}
              {rules.sections.map((section) => (
                <div key={section.title}>
                  <SectionHeader title={section.title} />
                  <ul style={{
                    margin: "10px 0 0",
                    padding: 0,
                    listStyle: "none",
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                  }}>
                    {section.rules.map((rule, i) => (
                      <li
                        key={i}
                        style={{
                          display: "flex",
                          gap: 10,
                          padding: "9px 14px",
                          background: "rgba(255,255,255,0.025)",
                          border: "1px solid rgba(143,106,47,0.15)",
                          borderRadius: 10,
                          fontSize: 13,
                          lineHeight: 1.55,
                          color: "#cfc8bd",
                          fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
                        }}
                      >
                        <span style={{ color: "#f2c14e", flexShrink: 0, marginTop: 1 }}>◦</span>
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </>
          ) : (
            /* Fallback for scenarios not in the full rules map */
            <>
              <p style={{ margin: 0, fontSize: 14, color: "#d8cfc4", lineHeight: 1.65, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
                {scenario.description}
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <StatBadge icon="💬" label="Communication"
                  value={scenario.communicationAlwaysOpen ? "Open throughout" : "Sand-timer based"}
                />
                <StatBadge icon="🚪" label="Exit Rule"
                  value={scenario.matchingExitsRequired ? "Each hero needs their colour exit" : "All heroes use the single purple exit"}
                />
                <StatBadge icon="⏳" label="Time Limit"
                  value={`${Math.floor(scenario.timeLimitSeconds / 60)}:${String(scenario.timeLimitSeconds % 60).padStart(2, "0")}`}
                />
              </div>
            </>
          )}

          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              marginTop: 4,
              padding: "11px 20px",
              background: "rgba(139,62,198,0.12)",
              border: "1px solid rgba(139,62,198,0.4)",
              borderRadius: 12,
              color: "#c084fc",
              fontSize: 13,
              fontWeight: 700,
              fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
              cursor: "pointer",
              transition: "background 0.2s",
              letterSpacing: "0.04em",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(139,62,198,0.22)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(139,62,198,0.12)"; }}
          >
            Close Rules
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Sub-components ───────────────────────────────────────────── */

function StatBadge({ icon, label, value, span2 = false }: {
  icon: string; label: string; value: string; span2?: boolean;
}) {
  return (
    <div style={{
      padding: "10px 14px",
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(143,106,47,0.2)",
      borderRadius: 12,
      gridColumn: span2 ? "1 / -1" : undefined,
    }}>
      <div style={{
        fontSize: 10,
        fontWeight: 700,
        color: "#a89e94",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
        marginBottom: 4,
      }}>
        {icon}  {label}
      </div>
      <div style={{
        fontSize: 12,
        color: "#f0e0c0",
        lineHeight: 1.45,
        fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
      }}>
        {value}
      </div>
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ height: 1, width: 20, background: "rgba(143,106,47,0.4)", flexShrink: 0 }} />
      <span style={{
        color: "#f2c14e",
        fontSize: 11,
        fontWeight: 800,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
        whiteSpace: "nowrap",
      }}>
        {title}
      </span>
      <div style={{ flex: 1, height: 1, background: "linear-gradient(to right, rgba(143,106,47,0.4), transparent)" }} />
    </div>
  );
}
