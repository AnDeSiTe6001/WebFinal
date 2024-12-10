// js/main.js
import { createBackground, createCamera } from './Background.js';
import { Monster } from './Monster.js';
import { 
    createPauseButton, 
    createPauseOverlay, 
    createScoreDisplay, 
    createStartScreen, 
    createGameOverScreen 
} from './UI.js';
import { createWallWithWindow } from './Wall.js';
import { Leaderboard } from './Leaderboard.js';
import { getDifficultySettings } from './Difficulty.js';
import { updateScore as updateScoreFunc } from './Score.js';
import { startGame, pauseGame, resumeGame, gameOver } from './GameFlow.js'; // 新增引用

import * as THREE from 'https://unpkg.com/three@0.126.1/build/three.module.js';
import { PointerLockControls } from 'https://unpkg.com/three@0.126.1/examples/jsm/controls/PointerLockControls.js';
import { OrbitControls } from 'https://unpkg.com/three@0.126.1/examples/jsm/controls/OrbitControls.js';

// 初始化場景和相機
const scene = createBackground();
const camera = createCamera();

// 初始化渲染器
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
// renderer.setClearColor(0x202020, 1);
renderer.shadowMap.enabled = true; // 啟用陰影
document.body.appendChild(renderer.domElement);

// 初始化 PointerLockControls
// const controls = new PointerLockControls(camera, document.body);

// 初始化 OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // 啟用阻尼效果
controls.dampingFactor = 0.05;
controls.target.set(0, 3, 0); // 設置 OrbitControls 的目標為模型門口位置
controls.update();

// 初始相機方向
// camera.position.set(0, 1.6, 0); 
// camera.lookAt(new THREE.Vector3(1, 1.6, 0));

// 添加牆壁與窗口
// const wall = createWallWithWindow();
// scene.add(wall);

// 狀態參數
let monsters = [];
let spawnInterval = 2; 
let monsterSpeed = 5; 
let lastSpawnTime = 0;
let isGameOver = false;
let isPaused = false;
let isStarted = false;

let score = 0;
let scoreMultiplier = 1; 

// 為了方便將狀態以參考型態傳遞，我們用物件包裝
// 這是小步驟，日後可用 class 或更精緻的方法
const isGameOverRef = { value: isGameOver };
const isPausedRef = { value: isPaused };
const isStartedRef = { value: isStarted };
const scoreRef = { value: score };
const scoreMultiplierRef = { value: scoreMultiplier };
const lastSpawnTimeRef = { value: lastSpawnTime };

// 初始化遊戲時鐘
const clock = new THREE.Clock();

// 初始化排行榜
const leaderboard = new Leaderboard();

// UI 元素
const { overlay: startScreen, buttons } = createStartScreen();
const pauseButton = createPauseButton();
pauseButton.style.display = 'none';
const { overlay: pauseOverlay, resumeButton } = createPauseOverlay();
const { overlay: gameOverOverlay, playAgainButton, chooseDifficultyButton, finalScore, leaderboardList } = createGameOverScreen();
const scoreDisplay = createScoreDisplay();
scoreDisplay.style.display = 'none';

// 更新分數函式已經在 Score.js 中
function updateHighScores(newScore) {
    return leaderboard.updateHighScores(newScore);
}

function displayLeaderboard(highScores) {
    leaderboardList.innerHTML = '';
    highScores.forEach((scoreItem, index) => {
        const listItem = document.createElement('li');
        listItem.style.display = 'flex'; 
        listItem.style.alignItems = 'center'; 
        listItem.style.marginBottom = '8px';

        const prefix = document.createElement('div');
        prefix.style.width = '30px'; 

        if (index === 0) {
            prefix.innerHTML = '<i class="fas fa-crown" style="color: gold;"></i>';
        } else if (index === 1) {
            prefix.innerHTML = '<i class="fas fa-crown" style="color: silver;"></i>';
        } else if (index === 2) {
            prefix.innerHTML = '<i class="fas fa-crown" style="color: #cd7f32;"></i>';
        } else {
            prefix.innerText = `${index + 1}.`;
        }

        const scoreText = document.createElement('div');
        scoreText.innerText = `分數: ${Math.round(scoreItem)}`;
        scoreText.style.marginLeft = '10px';

        listItem.appendChild(prefix);
        listItem.appendChild(scoreText);

        leaderboardList.appendChild(listItem);
    });

    console.log('Leaderboard updated with:', highScores);
}

// 選擇難度開始遊戲
Object.values(buttons).forEach((button) => {
    button.addEventListener('click', (event) => {
        const difficulty = event.target.dataset.difficulty;
        const settings = getDifficultySettings(difficulty);
        spawnInterval = settings.spawnInterval;
        monsterSpeed = settings.monsterSpeed;
        scoreMultiplierRef.value = settings.scoreMultiplier;
        // 使用 startGame 函式
        startGame({
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
        });
    });
});

function animate() {
    if (isPausedRef.value || isGameOverRef.value || !isStartedRef.value) return;

    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    const elapsed = clock.getElapsedTime();

    if (elapsed - lastSpawnTimeRef.value > spawnInterval) {
        monsters.push(new Monster(scene, monsterSpeed));
        lastSpawnTimeRef.value = elapsed;
    }

    for (let i = monsters.length - 1; i >= 0; i--) {
        const monster = monsters[i];
        monster.update(delta);

        if (monster.checkCollision(new THREE.Vector3(camera.position.x, 0, camera.position.z))) {
            gameOver({
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
                scoreDisplay
            });
            break;
        }
    }

    renderer.render(scene, camera);
}

// 暫停、恢復、再來一次等事件

pauseButton.addEventListener('click', () => {
    pauseGame({ isPausedRef, clock, pauseOverlay });
});

resumeButton.addEventListener('click', () => {
    resumeGame({ isPausedRef, clock, pauseOverlay, animate });
});

playAgainButton.addEventListener('click', () => {
    gameOverOverlay.style.display = 'none';
    startGame({
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
    });
});

chooseDifficultyButton.addEventListener('click', () => {
    gameOverOverlay.style.display = 'none';
    startScreen.style.display = 'flex';
});

window.addEventListener('keydown', (event) => {
    if (event.code === 'Tab' && isStartedRef.value) {
        event.preventDefault();
        controls.lock();
    }
});

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('click', (event) => {
    if (isPausedRef.value || controls.isLocked) return;

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(monsters.map(monster => monster.mesh));
    if (intersects.length > 0) {
        const intersectedMonster = intersects[0].object;
        const monsterIndex = monsters.findIndex(monster => monster.mesh === intersectedMonster);
        if (monsterIndex !== -1) {
            monsters[monsterIndex].remove(scene);
            monsters.splice(monsterIndex, 1);
            scoreRef.value = updateScoreFunc(scoreRef.value, scoreMultiplierRef.value, scoreDisplay, 10);
        }
    }
});

animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
