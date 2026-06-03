import { Achievement, AchievementId, GameSession } from "../game/gameTypes.js";
import { addEffect } from "./effectRules.js";

const DEFINITIONS: Record<AchievementId, Omit<Achievement, "achievementId" | "unlockedAt">> = {
  first_escape: { title: "First Escape", description: "Win a game." },
  speed_escape: { title: "Speed Escape", description: "Win with more than 60 seconds remaining." },
  silent_team: { title: "Silent Team", description: "Win without optional discussion." },
  no_timer_used: { title: "No Timer Used", description: "Win without using a timer space." },
  camera_control: { title: "Camera Control", description: "Disable a security camera." },
  explorer: { title: "Explorer", description: "Place at least three mall tiles." },
};

export function unlockAchievement(session: GameSession, achievementId: AchievementId): Achievement | undefined {
  if (session.achievements.some((achievement) => achievement.achievementId === achievementId)) return undefined;
  const achievement = { achievementId, ...DEFINITIONS[achievementId], unlockedAt: new Date().toISOString() };
  session.achievements.push(achievement);
  addEffect(session, { effectType: "AchievementUnlocked", animationKey: achievementId });
  return achievement;
}

export function evaluateVictoryAchievements(session: GameSession): Achievement[] {
  const before = session.achievements.length;
  unlockAchievement(session, "first_escape");
  if (session.sandTimer.remainingSeconds > 60) unlockAchievement(session, "speed_escape");
  if (session.sandTimer.usedSandTimerCellIds.length === 0) unlockAchievement(session, "no_timer_used");
  return session.achievements.slice(before);
}

export function evaluateTileAchievements(session: GameSession): Achievement[] {
  const before = session.achievements.length;
  if (session.placedTiles.length - 1 >= 3) unlockAchievement(session, "explorer");
  return session.achievements.slice(before);
}

