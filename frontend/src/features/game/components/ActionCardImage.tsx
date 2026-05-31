import { getActionCardImage } from "@/shared/utils/assetPaths";

export function ActionCardImage({ imageKey, label }: { imageKey?: string; label?: string }) {
  if (!imageKey) {
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
