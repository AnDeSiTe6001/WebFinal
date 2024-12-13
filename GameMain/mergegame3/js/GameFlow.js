// js/GameFlow.js
async function UpdateScoreDB(score, playerid) {
    const response = await fetch("http://localhost/GameMain/API/UpdateScore.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        action: "ScoreUpdate",
        curScore: score,
        id: playerid,
      }),
    })
    if (!response.ok) throw new Error("Network response was not OK");
    const data = await response.text();
    if (data) {
      console.log(data);
    } else {
      console.error("Unexpected response format:", data);
      alert("Unexpected response from server.");
    }
}
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
    animate,
    playerHealthRef,
    updateHealthDisplay
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
    scoreRef.value = updateScoreFunc(scoreRef.value, scoreMultiplierRef.value, scoreDisplay, 0);
    lastSpawnTimeRef.value = 0;

    playerHealthRef.value = 100; // Reset player health
    updateHealthDisplay(); // Update the health display

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

export async function gameOver({
    isGameOverRef,
    isPausedRef,
    clock,
    monsters,
    scene,
    finalScore,
    scoreRef,
    updateHighScores,
    displayLeaderboard,
    gameOverOverlay,
    pauseButton,
    scoreDisplay,
    player_id
}) {
    isGameOverRef.value = true;
    isPausedRef.value = true;
    clock.stop();
    // scoreRef.value+=1;
    finalScore.innerText = `Your Score: ${Math.round(scoreRef.value)}`;


    const updatedHighScores = updateHighScores(scoreRef.value);
    displayLeaderboard(updatedHighScores);
    
    let _score = Math.round(scoreRef.value);
    console.log(_score);
    let _player_id = player_id;
    // await UpdateScoreDB(_score, _player_id);
    
    monsters.forEach(m => m.remove(scene));
    monsters.length = 0;



    gameOverOverlay.style.display = 'flex';

    pauseButton.style.display = 'none';
    scoreDisplay.style.display = 'none';
}
