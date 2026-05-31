import { randomInt } from "node:crypto";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateRoomCode(): string {
  let code = "";
  for (let index = 0; index < 6; index += 1) {
    code += ALPHABET[randomInt(ALPHABET.length)];
  }
  return code;
}

