// js/Score.js
export function updateScore(
  currentScore,
  scoreMultiplier,
  scoreDisplay,
  points
) {
  const adjustedPoints = points * scoreMultiplier;
  const newScore = currentScore + adjustedPoints;
  scoreDisplay.innerText = `Score: ${Math.round(newScore)}`;
  return newScore;
}
