// js/UI.js

export function createPauseButton() {
    const button = document.createElement('button');
    button.innerHTML = '&#10073;&#10073;'; // 暫停圖示「||」
    button.style.position = 'absolute';
    button.style.top = '10px';
    button.style.left = '10px';
    button.style.padding = '10px';
    button.style.fontSize = '24px';
    button.style.cursor = 'pointer';
    button.style.border = 'none';
    button.style.background = 'rgba(255, 255, 255, 0.8)';
    button.style.borderRadius = '50%';
    button.style.width = '50px';
    button.style.height = '50px';
    document.body.appendChild(button);
    return button;
}

export function createPauseOverlay() {
    const overlay = document.createElement('div');
    overlay.style.position = 'absolute';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    overlay.style.color = 'white';
    overlay.style.display = 'flex';
    overlay.style.flexDirection = 'column';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.fontSize = '18px';
    overlay.style.padding = '20px';
    overlay.style.boxSizing = 'border-box';
    overlay.style.display = 'none'; // 初始隱藏
    document.body.appendChild(overlay);

    // 添加遊戲規則內容
    const title = document.createElement('h1');
    title.innerText = '遊戲暫停';
    overlay.appendChild(title);

    const rules = document.createElement('p');
    rules.innerText = `遊戲規則：
1. 點擊怪物將其消滅。
2. 按 Tab 鍵開始控制視角。
3. 小心！不要讓怪物接近你！`;
    overlay.appendChild(rules);

    const resumeButton = document.createElement('button');
    resumeButton.innerText = 'Resume Game';
    resumeButton.style.marginTop = '20px';
    resumeButton.style.padding = '10px 20px';
    resumeButton.style.fontSize = '12px';
    resumeButton.style.cursor = 'pointer';
    overlay.appendChild(resumeButton);

    return { overlay, resumeButton };
}

export function createScoreDisplay() {
    const scoreDiv = document.createElement('div');
    scoreDiv.id = 'score-display';
    scoreDiv.style.position = 'absolute';
    scoreDiv.style.top = '10px';
    scoreDiv.style.right = '10px';
    scoreDiv.style.fontSize = '24px';
    scoreDiv.style.color = 'white';
    scoreDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    scoreDiv.style.padding = '10px 20px';
    scoreDiv.style.borderRadius = '10px';
    scoreDiv.innerText = 'Score: 0';
    document.body.appendChild(scoreDiv);
    return scoreDiv;
}

export function createStartScreen() {
    const overlay = document.createElement('div');
    // 使用 class 來套用樣式，不使用 inline style
    overlay.classList.add('overlay');

    // 遊戲標題
    const title = document.createElement('h1');
    title.innerText = 'MONSTER SHOOTER';
    overlay.appendChild(title);

    // 難度選擇容器
    const difficultyContainer = document.createElement('div');
    // 使用 class 取代 inline style
    difficultyContainer.classList.add('difficulty-container');

    // 建立難度對應表
    const difficultyClasses = {
        '簡單': 'easy',
        '普通': 'normal',
        '困難': 'hard'
    };

    // 難度按鈕
    const difficulties = ['Easy', 'Normal', 'Hard']; // 使用英文
    const buttons = {};
    difficulties.forEach((level) => {
        const button = document.createElement('button');
        button.innerText = level;
        button.dataset.difficulty = level.toLowerCase(); // 英文小寫用於區分難度
        button.classList.add('difficulty-button', level.toLowerCase()); // 添加對應類名
        difficultyContainer.appendChild(button);
        buttons[level] = button;
    });

    overlay.appendChild(difficultyContainer);

    document.body.appendChild(overlay);

    return { overlay, buttons };
}


export function createGameOverScreen() {
    const overlay = document.createElement('div');
    overlay.style.position = 'absolute';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    overlay.style.color = 'white';
    overlay.style.display = 'flex';
    overlay.style.flexDirection = 'column';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.fontSize = '18px';
    overlay.style.padding = '20px';
    overlay.style.boxSizing = 'border-box';
    overlay.style.display = 'none'; // 初始隱藏
    document.body.appendChild(overlay);

    // 遊戲結束標題
    const title = document.createElement('h1');
    title.innerText = 'Game Over';
    title.classList.add('game-over-title'); // 添加樣式類名
    overlay.appendChild(title);

    // 最終分數顯示
    const finalScore = document.createElement('p');
    finalScore.id = 'final-score';
    finalScore.innerText = `Your Score: 0`;
    overlay.appendChild(finalScore);

    // 排行榜標題
    const leaderboardTitle = document.createElement('h2');
    leaderboardTitle.innerText = 'Leaderboard';
    leaderboardTitle.style.marginTop = '20px';
    overlay.appendChild(leaderboardTitle);

    // 排行榜列表
    const leaderboardList = document.createElement('ol');
    leaderboardList.id = 'leaderboard-list';
    leaderboardList.style.textAlign = 'left';
    leaderboardList.style.marginTop = '10px';
    leaderboardList.style.paddingLeft = '40px'; // 增加左側內邊距，避免圖示重疊
    overlay.appendChild(leaderboardList);

    // 按鈕容器
    const buttonsContainer = document.createElement('div');
    buttonsContainer.style.display = 'flex';
    buttonsContainer.style.gap = '10px';
    buttonsContainer.style.marginTop = '20px';

    // 再來一次按鈕
    const playAgainButton = document.createElement('button');
    playAgainButton.innerText = 'Play Again';
    // 使用 class 來控制樣式
    playAgainButton.classList.add('play-again-button');
    buttonsContainer.appendChild(playAgainButton);

    // 重新選擇難度按鈕
    const chooseDifficultyButton = document.createElement('button');
    chooseDifficultyButton.innerText = 'Choose Difficulty';
    // 使用 class 來控制樣式
    chooseDifficultyButton.classList.add('choose-difficulty-button');
    buttonsContainer.appendChild(chooseDifficultyButton);

    overlay.appendChild(buttonsContainer);

    return { overlay, playAgainButton, chooseDifficultyButton, finalScore, leaderboardList };
}
