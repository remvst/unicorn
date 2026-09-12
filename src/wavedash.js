if (!window.Wavedash) {
  throw new Error(
    "Wavedash is not initialized. If you're running your game locally use the `wavedash dev` command to ensure the Wavedash SDK is loaded."
  );
}

TRICK_ATTACK_LEADERBOARD = Wavedash.getOrCreateLeaderboard("trick-attack-highscore", 1, 0);
