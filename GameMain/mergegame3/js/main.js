// js/main.js
import { createBackground, createCamera } from './Background.js';
import { Monster } from './Monster.js';
import { 
    createPauseButton, 
    createPauseOverlay, 
    createScoreDisplay, 
    createStartScreen, 
    createGameOverScreen,
    createHealthDisplay
} from './UI.js';
import { createWallWithWindow } from './Wall.js';
import { Leaderboard } from './Leaderboard.js';
import { getDifficultySettings } from './Difficulty.js';
import { updateScore as updateScoreFunc } from './Score.js';
import { startGame, pauseGame, resumeGame, gameOver } from './GameFlow.js';

import * as THREE from 'https://unpkg.com/three@0.150.1/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.150.1/examples/jsm/controls/OrbitControls.js';
import { parllaxInit,
    setupParallaxCameras, 
    setupParallaxScene, 
    setupRenderer,
    preParallaxAnimate,
    postParallaxAnimate
} from './parallax.js';
// 初始化場景和相機
const scene = createBackground();
// const camera = createCamera();
setupParallaxScene(scene);
const gameCamera = setupParallaxCameras(scene);
const camera = gameCamera;
await parllaxInit(scene);
// const camera = gameCamera;
const renderer = setupRenderer();
// 初始化渲染器
// const renderer = new THREE.WebGLRenderer({antialias:true});
// renderer.setSize(window.innerWidth, window.innerHeight);
// renderer.shadowMap.enabled = true;
// document.body.appendChild(renderer.domElement);
const sniperScope = document.getElementById('sniper-scope');

// // 初始化 OrbitControls
// const controls = new OrbitControls(camera, renderer.domElement);
// controls.enableDamping = true; 
// controls.dampingFactor = 0.05;
// controls.target.set(0, 3, 0);
// controls.update();

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

let playerHealth = 100;
const playerHealthRef = { value: playerHealth };
let lastAttackTime = 0;
const attackCooldown = 1; // Cooldown time in seconds

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
const healthDisplay = createHealthDisplay();
healthDisplay.style.display = 'block';

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

function updateHealthDisplay() {
    healthDisplay.innerText = `Health: ${playerHealthRef.value}`;
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
            animate,
            playerHealthRef,
            updateHealthDisplay
        });

        // 顯示狙擊鏡游標
        document.body.style.cursor = 'url("./images/crosshair32.png") 16 16, auto';
    });
});

// 新增 spawnMonster 函數，使用 callback 確保 monster.mesh 已載入完成後才 push
function spawnMonster() {
    const playerPosition = camera.position.clone();

    const monster = new Monster(scene, monsterSpeed, playerPosition, () => {
        monsters.push(monster);
        console.log('Monster spawned:', monster);
    });
}

function shootLaser(startPosition, targetPosition) {
    // 計算雷射線的方向和距離
    const direction = new THREE.Vector3().subVectors(targetPosition, startPosition).normalize();
    const distance = startPosition.distanceTo(targetPosition);

    // 創建圓柱體幾何作為雷射線
    const laserGeometry = new THREE.CylinderGeometry(0.05, 0.05, distance, 8);
    // const laserMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00, emissive: 0xffff00 }); // 明亮黃色
    // 增強材質屬性
    // 定義雷射線材質為紅色，增加發光效果
    const laserMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xff0000, // 明亮紅色
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending // 增加發光效果
    });

    const laserMesh = new THREE.Mesh(laserGeometry, laserMaterial);

    // 設置圓柱體的位置和朝向
    laserMesh.position.copy(startPosition).add(targetPosition).multiplyScalar(0.5); // 雷射線在中間
    laserMesh.lookAt(targetPosition); // 指向目標點

    // 修正旋轉，圓柱體默認沿Y軸，需要調整到射線方向
    laserMesh.rotateX(Math.PI / 2);

    // 提高渲染順序，確保雷射線在最前面
    laserMesh.renderOrder = 1;

    // 添加雷射線到場景
    scene.add(laserMesh);
    console.log('Laser added to scene:', laserMesh);

    // 設置雷射線自動移除
    setTimeout(() => {
        scene.remove(laserMesh);
        console.log('Laser removed from scene');
    }, 50); // 雷射線顯示時間（毫秒）
}

function animate() {
    if (isPausedRef.value || isGameOverRef.value || !isStartedRef.value) return;

    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    const elapsed = clock.getElapsedTime();
    const playerPosition = camera.position.clone(); // Get player's current position

    monsters.forEach((monster) => {
        monster.update(delta, playerPosition); // Pass player's position to update method
    });

    if (elapsed - lastSpawnTimeRef.value > spawnInterval) {
        spawnMonster(); // 使用 spawnMonster 代替直接 push
        lastSpawnTimeRef.value = elapsed;
    }

    for (let i = monsters.length - 1; i >= 0; i--) {
        const monster = monsters[i];
        monster.update(delta, playerPosition);

        if (monster.checkCollision(new THREE.Vector3(camera.position.x, 0, camera.position.z))) {
            if (elapsed - lastAttackTime > attackCooldown) {
                playerHealthRef.value -= 10;
                updateHealthDisplay();
                lastAttackTime = elapsed;
                if (playerHealthRef.value <= 0) {
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
                }
            }
            break;
        }
    }
    preParallaxAnimate();
    renderer.render(scene, camera);
    postParallaxAnimate();
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
    document.body.style.cursor = 'url("images/crosshair32.png") 16 16, auto';
});

playAgainButton.addEventListener('click', () => {
    gameOverOverlay.style.display = 'none';
    playerHealthRef.value = 100; // Reset player health
    updateHealthDisplay(); // Update the health display
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
        animate,
        playerHealthRef,
        updateHealthDisplay
    }); 
    // 顯示狙擊鏡游標
    document.body.style.cursor = "url('images/crosshair32.png'), auto";
});

chooseDifficultyButton.addEventListener('click', () => {
    gameOverOverlay.style.display = 'none';
    startScreen.style.display = 'flex';
});

window.addEventListener('keydown', (event) => {
    if (event.code === 'Tab' && isStartedRef.value) {
        event.preventDefault();
        // controls.lock();
    }
});

const raycaster = new THREE.Raycaster();
raycaster.near = 0.1;
raycaster.far = 1000;
const mouse = new THREE.Vector2();

window.addEventListener('click', (event) => {
    // if (isPausedRef.value || controls.isLocked) return;
    if (isPausedRef.value) return;

    if (event.target.closest('.difficulty-button')) { 
        return;
    }

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);


    const startPosition = new THREE.Vector3(0, 3, 15);

    // 計算終點，檢測場景中的交點
    const intersects = raycaster.intersectObjects(scene.children, true); // 檢測與場景物件的交點

    let targetPosition;

    if (intersects.length > 0) {
        // 取第一個交點作為目標點
        targetPosition = intersects[0].point;
        console.log('Mouse click target:', targetPosition);
    } else {
        // 如果沒有交點，則設置一個遠處的目標點
        const direction = raycaster.ray.direction.clone().normalize();
        targetPosition = startPosition.clone().add(direction.multiplyScalar(1000)); // 遠處目標
        console.log('Mouse click far target:', targetPosition);
    }

    // 發射雷射線
    shootLaser(startPosition, targetPosition);    

    const validMeshes = monsters
        .map(monster => monster.mesh)
        .filter(mesh => mesh !== null && mesh !== undefined);

    // 進行 Raycaster 的初步相交檢測
    // const intersects = raycaster.intersectObjects(validMeshes, true);
    // console.log('Intersects:', intersects);

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
