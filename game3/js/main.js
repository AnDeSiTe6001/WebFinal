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
import { startGame, pauseGame, resumeGame, gameOver } from './GameFlow.js';

import * as THREE from 'https://unpkg.com/three@0.126.1/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.126.1/examples/jsm/controls/OrbitControls.js';

// 初始化場景和相機
const scene = createBackground();
const camera = createCamera();

// 初始化渲染器
const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);
const sniperScope = document.getElementById('sniper-scope');

// 初始化 OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; 
controls.dampingFactor = 0.05;
controls.target.set(0, 3, 0);
controls.update();

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

const isGameOverRef = { value: isGameOver };
const isPausedRef = { value: isPaused };
const isStartedRef = { value: isStarted };
const scoreRef = { value: score };
const scoreMultiplierRef = { value: scoreMultiplier };
const lastSpawnTimeRef = { value: lastSpawnTime };

const clock = new THREE.Clock();
const leaderboard = new Leaderboard();

// UI 元素
const { overlay: startScreen, buttons } = createStartScreen();
const pauseButton = createPauseButton();
pauseButton.style.display = 'none';
const { overlay: pauseOverlay, resumeButton } = createPauseOverlay();
const { overlay: gameOverOverlay, playAgainButton, chooseDifficultyButton, finalScore, leaderboardList } = createGameOverScreen();
const scoreDisplay = createScoreDisplay();
scoreDisplay.style.display = 'none';

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

// 狙擊鏡
// function showSniperScope() {
//     sniperScope.style.display = 'block';
// }

// function hideSniperScope() {
//     sniperScope.style.display = 'none';
// }

// 選擇難度開始遊戲
Object.values(buttons).forEach((button) => {
    button.addEventListener('click', (event) => {
        const difficulty = event.target.dataset.difficulty;
        const settings = getDifficultySettings(difficulty);
        spawnInterval = settings.spawnInterval;
        monsterSpeed = settings.monsterSpeed;
        scoreMultiplierRef.value = settings.scoreMultiplier;

        console.log(`Difficulty selected: ${difficulty}`);
        console.log(`spawnInterval: ${spawnInterval}, monsterSpeed: ${monsterSpeed}, scoreMultiplier: ${scoreMultiplierRef.value}`);

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

        // 顯示狙擊鏡游標
        document.body.style.cursor = 'url("images/crosshair.png") 16 16, auto';
    });
});

// 新增 spawnMonster 函數，使用 callback 確保 monster.mesh 已載入完成後才 push
function spawnMonster() {
    const playerPosition = camera.position.clone();
    const playerDirection = new THREE.Vector3();
    camera.getWorldDirection(playerDirection);

    const monster = new Monster(scene, monsterSpeed, playerPosition, playerDirection, () => {
        // onLoadCallback，確保 monster.mesh 不為 null
        monsters.push(monster);
        console.log('Monster spawned:', monster);
    });
}

function animate() {
    if (isPausedRef.value || isGameOverRef.value || !isStartedRef.value) return;

    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    const elapsed = clock.getElapsedTime();

    const playerPosition = camera.position.clone(); // 每幀獲取相機位置

    monsters.forEach((monster) => {
        monster.update(delta, playerPosition); // 更新怪物位置與方向
    });


    if (elapsed - lastSpawnTimeRef.value > spawnInterval) {
        spawnMonster(); // 使用 spawnMonster 代替直接 push
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

    // 暫停時隱藏狙擊鏡游標
    document.body.style.cursor = 'auto';    
});

resumeButton.addEventListener('click', () => {
    resumeGame({ isPausedRef, clock, pauseOverlay, animate });
    // 恢復遊戲時顯示狙擊鏡游標
    document.body.style.cursor = 'url("images/crosshair.png") 16 16, auto';
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
    // 顯示狙擊鏡游標
    document.body.style.cursor = 'url("images/crosshair.png") 16 16, auto';
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
raycaster.near = 0.1;
raycaster.far = 1000;
const mouse = new THREE.Vector2();

window.addEventListener('click', (event) => {
    if (isPausedRef.value || controls.isLocked) return;

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    const validMeshes = monsters
        .map(monster => monster.mesh)
        .filter(mesh => mesh !== null && mesh !== undefined);

    // 進行 Raycaster 的初步相交檢測
    const intersects = raycaster.intersectObjects(validMeshes, true);
    console.log('Intersects:', intersects);

    // 如果沒有精確檢測到，進行範圍擴展檢測
    if (intersects.length === 0) {
        console.log('No direct intersects, checking extended range...');

        const extendedRange = 2; // 擴大範圍，單位為模型的邊界框尺寸
        const hitMonsterIndex = monsters.findIndex(monster => {
            if (!monster.mesh) return false;
            
            const box = new THREE.Box3().setFromObject(monster.mesh);
            const center = new THREE.Vector3();
            box.getCenter(center);
            
            // 計算滑鼠 Ray 與物體中心的距離
            const distance = raycaster.ray.distanceToPoint(center);
            console.log('Distance to monster:', distance);
            
            return distance <= extendedRange; // 判定是否在擴展範圍內
        });

        if (hitMonsterIndex !== -1) {
            const hitMonster = monsters[hitMonsterIndex];
            hitMonster.remove(scene);
            monsters.splice(hitMonsterIndex, 1);
            const basePoints = 10;
            scoreRef.value = updateScoreFunc(scoreRef.value, scoreMultiplierRef.value, scoreDisplay, basePoints);            
            console.log('Monster killed in extended range:', hitMonster);
            return;
        }
    }

    // 精確檢測到的情況處理
    if (intersects.length > 0) {
        const intersectedObject = intersects[0].object;

        // 不使用 contains，改用 traverse
        const hitMonsterIndex = monsters.findIndex(monster => {
            if (!monster.mesh) return false;
            let found = false;
            monster.mesh.traverse((child) => {
                if (child === intersectedObject) {
                    found = true;
                }
            });
            return found;
        });

        if (hitMonsterIndex !== -1) {
            const hitMonster = monsters[hitMonsterIndex];
            hitMonster.remove(scene);
            monsters.splice(hitMonsterIndex, 1);
            const basePoints = 10;
            scoreRef.value = updateScoreFunc(scoreRef.value, scoreMultiplierRef.value, scoreDisplay, basePoints);            
            console.log('Monster killed:', hitMonster);
        }
    } else {
        console.log('No intersects detected.');
    }
});



animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

