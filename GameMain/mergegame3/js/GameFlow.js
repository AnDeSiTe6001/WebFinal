// js/GameFlow.js
import * as GameFunction from "../../API/GameFunction.js";
export function startGame({
    isStartedRef,
    isPausedRef,
    isGameOverRef,
    startScreen,
    pauseButton,
    scoreDisplay,
    monsters,
    scene,
    scoreRef,
    scoreMultiplierRef,
    updateScoreFunc,
    lastSpawnTimeRef,
    clock,
    animate
}) {
    isStartedRef.value = true;
    isPausedRef.value = false;
    isGameOverRef.value = false;

    startScreen.style.display = 'none';
    pauseButton.style.display = 'block';
    scoreDisplay.style.display = 'block';

    // 清空怪物與分數
    monsters.forEach(m => m.remove(scene));
    monsters.length = 0;

    // 在更新分數前先重置分數
    scoreRef.value = 0;
    let playerid = parseInt(
        document.getElementById("PlayerID").textContent.replace("ID: ", "")
    );
    scoreRef.value = updateScoreFunc(scoreRef.value, scoreMultiplierRef.value, scoreDisplay, 0,playerid);
    lastSpawnTimeRef.value = 0;

    clock.start();
    animate();
}

export function pauseGame({ isPausedRef, clock, pauseOverlay }) {
    if (!isPausedRef.value) {
        isPausedRef.value = true;
        clock.stop();
        pauseOverlay.style.display = 'flex';
    }
}

export function resumeGame({ isPausedRef, clock, pauseOverlay, animate }) {
    if (isPausedRef.value) {
        isPausedRef.value = false;
        clock.start();
        pauseOverlay.style.display = 'none';
        animate();
    }
}

export function gameOver({
    isGameOverRef,
    isPausedRef,
    clock,
    monsters,
    scene,
    finalScore,
    Highest_Score,
    playerid,
    scoreRef,
    updateHighScores,
    displayLeaderboard,
    gameOverOverlay,
    pauseButton,
    scoreDisplay
}) {
    isGameOverRef.value = true;
    isPausedRef.value = true;
    clock.stop();

    monsters.forEach(m => m.remove(scene));
    monsters.length = 0;

    finalScore.innerText = `Your Score: ${Math.round(scoreRef.value)}`;
    
    /* update to database */
    GameFunction.UpdateScore(Math.round(scoreRef.value), playerid);

    //let highestscore = GameFunction.GetHighestScore(playerid);
    //console.log(`(gameOver) Get Highest Score: ${highestscore}`);
    //Highest_Score.innerText = `Your highest score: ${highestscore}`;
    const updatedHighScores = updateHighScores(scoreRef.value);
    displayLeaderboard(updatedHighScores);

    gameOverOverlay.style.display = 'flex';

    pauseButton.style.display = 'none';
    scoreDisplay.style.display = 'none';
}
