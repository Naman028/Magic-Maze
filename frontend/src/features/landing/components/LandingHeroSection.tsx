import { getHeroCharacterFallbackImage, getHeroCharacterImage } from "../../game/utils/heroVisuals";
import { getDoSomethingImage } from "@/shared/utils/assetPaths";
import { FeatureCard } from "./FeatureCard";

const heroes = ["Mage", "Elf", "Barbarian", "Dwarf"];

export function LandingHeroSection() {
  return (
    <section className="landing-hero">
      <div className="hero-title">
        <p>MAGIC MAZE ONLINE</p>
        <h1>ENTER <span>THE</span> MAZE</h1>
        <h2>Create a room, share the code, and escape together.</h2>
      </div>
      <div className="hero-showcase character-showcase" aria-hidden>
        <div className="hourglass-figure">⌛</div>
        {heroes.map((hero) => (
          <img
            key={hero}
            className={`landing-character ${hero.toLowerCase()}`}
            src={getHeroCharacterImage(hero)}
            alt=""
            onError={(event) => {
              event.currentTarget.src = getHeroCharacterFallbackImage(hero);
            }}
          />
        ))}
        <div className="do-something">
          <img src={getDoSomethingImage()} alt="" />
          <small>DO SOMETHING!</small>
        </div>
      </div>
      <div className="landing-cards">
        <FeatureCard icon="♟" title="Shared Heroes" text="Everyone can move any hero." />
        <FeatureCard icon="🂠" title="Action Cards" text="Use only your active card." />
        <FeatureCard icon="🔎" title="Tile Deck" text="Pick and rotate maze tiles." />
        <FeatureCard icon="⌛" title="Timed Windows" text="Talk only during Voice ON." />
      </div>
    </section>
  );
}
