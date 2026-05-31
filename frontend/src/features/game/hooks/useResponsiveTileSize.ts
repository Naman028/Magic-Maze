import { useEffect, useState } from "react";

function computeTileSize() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  if (width >= 1600) return Math.min(340, Math.max(280, height * 0.34));
  if (width >= 1280) return Math.min(315, Math.max(260, height * 0.32));
  if (width >= 1024) return Math.min(290, Math.max(240, height * 0.31));
  if (width >= 768) return 230;
  return 190;
}

export function useResponsiveTileSize() {
  const [tileSize, setTileSize] = useState(computeTileSize);

  useEffect(() => {
    const onResize = () => setTileSize(computeTileSize());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return tileSize;
}
