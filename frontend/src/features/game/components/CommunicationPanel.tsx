import { CommunicationState } from "@/domain/game.types";
import { emitters } from "@/services/socket/socketEmitters";
import { getDoSomethingFallbackImage, getDoSomethingImage } from "@/shared/utils/assetPaths";

export function CommunicationPanel({ communication }: { communication: CommunicationState }) {
  return (
    <section className={`communication-panel ${communication.voiceAllowed ? "voice-on" : "voice-off"}`}>
      <span>{communication.voiceAllowed ? "VOICE ON" : "VOICE OFF"}</span>
      <div>
        <strong>{communication.voiceAllowed ? "Now you can talk" : "Now you cannot talk"}</strong>
      </div>
      <button className="signal-button do-something-button" onClick={() => emitters.signal("Attention")}>
        <img
          src={getDoSomethingImage()}
          alt="Do Something"
          onError={(event) => {
            event.currentTarget.src = getDoSomethingFallbackImage();
          }}
        />
        Do Something
      </button>
    </section>
  );
}
