import * as THREE from 'https://unpkg.com/three@0.150.1/build/three.module.js';
import * as CameraUtils from 'https://unpkg.com/three@0.150.1/examples/jsm/utils/CameraUtils.js';
import { TransformControls } from 'https://unpkg.com/three@0.150.1/examples/jsm/controls/TransformControls.js';
import { OrbitControls } from 'https://unpkg.com/three@0.150.1/examples/jsm/controls/OrbitControls.js';

let orbitalCamera, scene, renderer;
let transformControls, gameCamera;
let bottomLeftCorner, bottomRightCorner, topLeftCorner;
let frustumHelper, isGameCameraActive = false, net, video, orbitControls;
let planeTexture = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight);
let nearPlane;
let headPositionHistory = [];
const smoothingFactor = 5; // Number of frames to average
const movementThreshold = 0.1; // Minimum movement in pixels to consider
let lastHeadPos = { x: 0, y: 0 };
let debugMode = true;
let cameraPositionMarker;
let parallaxCoef = 0.01; // Initial coefficient value
let lerpCoef = 0.3; // Lerp coefficient
init();

async function init() {
    await loadPosenet();
    setupRenderer();
    setupScene();
    setupCameras();
    setupGround();
    setupLights();
    setupControls();
    setupVideo();
    setCameraNearPlane();
    addEventListeners();
}

async function loadPosenet() {
    net = await posenet.load();
}

async function getHeadPosition() {
    try {
        video.play();
        const pose = await net.estimateSinglePose(video, { flipHorizontal: false });
        const keypoint = pose.keypoints.find(k => k.part === 'nose');
        if (keypoint && keypoint.score > 0.5) {
            return keypoint.position;
        } else {
            throw new Error('Head position not detected');
        }
    } catch (error) {
        throw error;
    }
}

function setupRenderer() {
    const container = document.getElementById('container');
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setAnimationLoop(animate);
    renderer.localClippingEnabled = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    container.appendChild(renderer.domElement);
}

function setupScene() {
    scene = new THREE.Scene();
    setupCameraPositionMarker();
    addRandomObjects();
}

function setupCameraPositionMarker() {
    const markerGeometry = new THREE.SphereGeometry(2, 32, 32);
    const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    cameraPositionMarker = new THREE.Mesh(markerGeometry, markerMaterial);
    scene.add(cameraPositionMarker);
}

function addRandomObjects() {
    const geometry = new THREE.BoxGeometry(10, 10, 10);
    const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });

    for (let i = 0; i < 10; i++) {
        const box = new THREE.Mesh(geometry, material);
        box.position.set(
            Math.random() * 200 - 100,
            Math.random() * 200 - 100,
            Math.random() * 200 - 100
        );
        scene.add(box);
    }
}

function setupCameras() {
    orbitalCamera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 5000);
    orbitalCamera.position.set(0, 75, 160);

    gameCamera = new THREE.PerspectiveCamera(45, 1.0, 0.1, 500.0);
    gameCamera.position.set(0, 75, 160);
    scene.add(gameCamera);

    frustumHelper = new THREE.CameraHelper(gameCamera);
    scene.add(frustumHelper);

    bottomLeftCorner = new THREE.Vector3();
    bottomRightCorner = new THREE.Vector3();
    topLeftCorner = new THREE.Vector3();
}

function setupGround() {
    const groundGeo = new THREE.PlaneGeometry(500, 500);
    const groundMat = new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);
}

function setupLights() {
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(50, 50, 50).normalize();
    scene.add(directionalLight);
}

function setupControls() {
    // transformControls = new TransformControls(orbitalCamera, renderer.domElement);
    // transformControls.attach(gameCamera);
    // scene.add(transformControls);

    orbitControls = new OrbitControls(orbitalCamera, renderer.domElement);
    orbitControls.enableDamping = true;
    orbitControls.dampingFactor = 0.25;
    orbitControls.screenSpacePanning = false;
    orbitControls.maxPolarAngle = Math.PI / 2;

    // transformControls.addEventListener('mouseDown', () => orbitControls.enabled = false);
    // transformControls.addEventListener('mouseUp', () => orbitControls.enabled = true);
}

async function setupVideo() {
    video = document.createElement('video');
    video.id = 'webcam';
    video.width = 320;
    video.height = 240;
    document.body.appendChild(video);

    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    video.play();
}

function addEventListeners() {
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('keydown', onKeyDown);
    document.getElementById('toggleDebug').addEventListener('change', toggleDebugMode);
    document.getElementById('ParallaxCoefSlider').addEventListener('input', updateParallaxCoef);
    document.getElementById('LerpCoefSlider').addEventListener('input', updateLerpCoef); // New event listener
    document.getElementById('switchToGameCamera').addEventListener('click', switchToGameCamera); // New event listener
    document.getElementById('switchToOrbitalCamera').addEventListener('click', switchToOrbitalCamera); // New event listener
}

function updateParallaxCoef(event) {
    parallaxCoef = parseFloat(event.target.value);
}

function updateLerpCoef(event) {
    lerpCoef = parseFloat(event.target.value);
}

function renderGame(thisPlane) {
    if (!thisPlane) return;

    thisPlane.updateMatrixWorld();
    thisPlane.geometry.computeBoundingBox();
    const bbox = thisPlane.geometry.boundingBox.clone();
    bbox.applyMatrix4(thisPlane.matrixWorld);

    bottomLeftCorner.set(bbox.min.x, bbox.min.y, bbox.min.z);
    bottomRightCorner.set(bbox.max.x, bbox.min.y, bbox.min.z);
    topLeftCorner.set(bbox.min.x, bbox.max.y, bbox.min.z);

    CameraUtils.frameCorners(gameCamera, bottomLeftCorner, bottomRightCorner, topLeftCorner, false);
}

function toggleDebugMode(event) {
    debugMode = event.target.checked;
    frustumHelper.visible = debugMode;
    nearPlane.visible = debugMode;
}

function onWindowResize() {
    orbitalCamera.aspect = window.innerWidth / window.innerHeight;
    orbitalCamera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

async function onKeyDown(event) {
    const step = event.shiftKey ? 5 : 0.1;
    switch (event.key) {
        case 'ArrowUp':
            gameCamera.position.y += step;
            break;
        case 'ArrowDown':
            gameCamera.position.y -= step;
            break;
        case 'ArrowLeft':
            gameCamera.position.x -= step;
            break;
        case 'ArrowRight':
            gameCamera.position.x += step;
            break;
        case 'w':
            gameCamera.position.z -= step;
            break;
        case 's':
            gameCamera.position.z += step;
            break;
        case 'g':
            toggleGameCamera();
            break;
        case 'h':
            await setCameraToHeadPosition();
            break;
    }
}

function toggleGameCamera() {
    if (isGameCameraActive) {
        orbitalCamera.position.set(0, 75, 160);
        orbitalCamera.rotation.set(0, 0, 0);
        CameraUtils.frameCorners(orbitalCamera, bottomLeftCorner, bottomRightCorner, topLeftCorner, false);
        orbitalCamera.updateProjectionMatrix();
        isGameCameraActive = false;
    } else {
        orbitalCamera.position.copy(gameCamera.position);
        orbitalCamera.rotation.copy(gameCamera.rotation);
        orbitalCamera.updateProjectionMatrix();
        isGameCameraActive = true;
    }
}

function lerp(start, end, t) {
    return start * (1 - t) + end * t;
}

async function setCameraToHeadPosition() {
    try {
        if (video.readyState >= 2) {
            const headPos = await getHeadPosition();

            const planeCenter = new THREE.Vector3();
            nearPlane.getWorldPosition(planeCenter);

            let targetX = planeCenter.x + (-headPos.x + 160) * parallaxCoef;
            let targetY = planeCenter.y + (-headPos.y + 120) * parallaxCoef;

            // calculate delta values, last position - current position
            const deltaX = Math.abs(lastHeadPos.x - headPos.x);
            const deltaY = Math.abs(lastHeadPos.y - headPos.y);
            //log the delta values
            // console.log(deltaX, deltaY);

            if (deltaX > movementThreshold || deltaY > movementThreshold) {
                gameCamera.position.x = lerp(gameCamera.position.x, targetX, lerpCoef);
                gameCamera.position.y = lerp(gameCamera.position.y, targetY, lerpCoef);
                gameCamera.position.z = planeCenter.z + 1;
            }
            lastHeadPos = headPos;
        } else {
            video.onloadedmetadata = async () => {};
        }
    } catch (error) {
        console.error('Error getting head position:', error);
    }
}

function setCameraNearPlane() {
    const { width, height } = getNearPlane();
    const planeGeo = new THREE.PlaneGeometry(width, height);
    const planeMat = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
    nearPlane = new THREE.Mesh(planeGeo, planeMat);
    nearPlane.rotation.set(orbitalCamera.rotation.x, orbitalCamera.rotation.y, orbitalCamera.rotation.z);
    nearPlane.position.set(orbitalCamera.position.x, orbitalCamera.position.y, orbitalCamera.position.z - orbitalCamera.near - 1);
    scene.add(nearPlane);
}

function getNearPlane() {
    const near = orbitalCamera.near;
    const fov = orbitalCamera.fov * (Math.PI / 180);
    const aspect = orbitalCamera.aspect;

    const height = 2 * Math.tan(fov / 2) * near;
    const width = height * aspect;
    return { width, height };
}

function animate() {
    const currentRenderTarget = renderer.getRenderTarget();
    const currentXrEnabled = renderer.xr.enabled;
    const currentShadowAutoUpdate = renderer.shadowMap.autoUpdate;
    renderer.xr.enabled = false;
    renderer.shadowMap.autoUpdate = false;

    if (debugMode) {
        frustumHelper.visible = true;
        nearPlane.visible = true;
    } else {
        frustumHelper.visible = false;
        nearPlane.visible = false;
    }
    renderGame(nearPlane);
    if (isGameCameraActive) {
        renderer.render(scene, gameCamera);
    } else {
        renderer.render(scene, orbitalCamera);
    }

    frustumHelper.update();
    orbitControls.update();
    setCameraToHeadPosition();
    updateCameraPositionMarker();
    renderer.xr.enabled = currentXrEnabled;
    renderer.shadowMap.autoUpdate = currentShadowAutoUpdate;
    renderer.setRenderTarget(currentRenderTarget);
}

function updateCameraPositionMarker() {
    cameraPositionMarker.position.copy(gameCamera.position);
}

function switchToGameCamera() {
    isGameCameraActive = true;
}

function switchToOrbitalCamera() {
    isGameCameraActive = false;
}