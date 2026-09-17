/// Centralized constants for Bujho gameplay, timing, scoring, and hardware sensors.
class GameConstants {
  // --- Tilt Detection Hardware Thresholds ---
  static const double tiltPassThresholdLow = 9.5;
  static const double tiltPassThresholdNormal = 8.5;
  static const double tiltPassThresholdHigh = 7.0;

  static const double tiltCorrectThresholdLow = 8.5;
  static const double tiltCorrectThresholdNormal = 7.0;
  static const double tiltCorrectThresholdHigh = 5.5;

  static const double tiltFlatThreshold = 2.5;
  static const double tiltResetThreshold = 3.0;

  // --- Gameplay Timing ---
  static const Duration feedbackDisplayDuration = Duration(milliseconds: 450);
  static const Duration tiltCooldownDuration = Duration(milliseconds: 600);
  static const Duration orientationDelay = Duration(milliseconds: 750);
  static const int preGameCountdownSeconds = 3;
  static const int defaultGameDuration = 60;
  static const int defaultTeamRounds = 3;

  // --- Scoring & Streaks ---
  static const int pointsForCorrect = 1;
  static const int pointsForStreak3 = 2;
  static const int pointsForStreak5 = 3;
  static const int streakThresholdHot = 3;
  static const int streakThresholdFire = 5;
  static const int consecutivePassesForPenalty = 5;
  static const int penaltyForPassLimit = 1;

  // --- Deck Limits & Validation ---
  static const int maxDeckNameLength = 50;
  static const int maxDeckDescriptionLength = 200;
  static const int minDeckWords = 5;
  static const int maxDeckWords = 500;
  static const int maxWordLength = 100;

  // --- Word History & Cooldowns ---
  static const double wordCooldownCapacityRatio = 0.65;
  static const int recentDeckHistorySize = 2;
}
