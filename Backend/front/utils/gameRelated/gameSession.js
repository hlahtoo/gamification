export class GameSession {
  constructor(userId, gameName, level) {
    this.userId = userId;
    this.gameSession = {
      game_name: gameName,
      level: level,
      total_mistakes: 0,
      final_score: 0,
      start_time: new Date().toISOString(), // Capture the start time when the session starts
      duration: 0, // We'll calculate this at the end of the session
      success: false, // Default to false until game success is determined
    };
    this.startTime = Date.now(); // Capture start time for duration calculation
  }

  incrementMistakes() {
    this.gameSession.total_mistakes += 1;
  }

  setFinalScore(score) {
    this.gameSession.final_score = score;
  }

  setSuccessStatus(success) {
    this.gameSession.success = success;
  }

  endSession() {
    const endTime = Date.now();
    const durationInMs = endTime - this.startTime;
    const durationInSeconds = Math.floor(durationInMs / 1000); // Convert duration to seconds
    this.gameSession.duration = durationInSeconds; // Set the duration in seconds
  }

  toObject() {
    return {
      userId: this.userId,
      gameSession: { ...this.gameSession },
    };
  }
}