import { getActionCardImage, getActionDeckImage } from "@/shared/utils/assetPaths";

export function ActionCardImage({ imageKey, label, fallback = "solo" }: { imageKey?: string; label?: string; fallback?: "solo" | "deck" }) {
  if (!imageKey) {
    if (fallback === "deck") {
      return <img className="action-card-image" src={getActionDeckImage()} alt={label ?? "Action card deck"} />;
    }

    return (
      <div className="solo-card-fallback">
        <strong>Solo Control</strong>
        <span>N S E W</span>
        <small>Explore · Vortex · Escalator</small>
      </div>
    );
  }
  return <img className="action-card-image" src={getActionCardImage(imageKey)} alt={label ?? imageKey} />;
}
