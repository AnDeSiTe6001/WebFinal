import * as THREE from 'https://unpkg.com/three@0.150.1/build/three.module.js';
import * as CameraUtils from 'https://unpkg.com/three@0.150.1/examples/jsm/utils/CameraUtils.js';

let orbitalCamera; // only for near plane calculation
let scene, renderer;
let gameCamera;
let bottomLeftCorner, bottomRightCorner, topLeftCorner;
let frustumHelper, isGameCameraActive = false, net, video;
let nearPlane;
let debugMode = false;
let parallaxCoef = 0.004; // Initial coefficient value
// let smoothFactor = 0.3; // smoothFactor

let kalmanFilterX;
let kalmanFilterY;
let kalmanR = 0.06; // Initial R value
let kalmanQ = 0.3;  // Initial Q value
let flipHorizontal = false; // New variable for flipHorizontal


export async function parllaxInit(_scene) {
    scene = _scene;
    console.log('init');
    kalmanFilterX = new KalmanFilter({ R: kalmanR, Q: kalmanQ, A: 1, B: 0, C: 1 });
    kalmanFilterY = new KalmanFilter({ R: kalmanR, Q: kalmanQ, A: 1, B: 0, C: 1 });

    await loadPosenet();
    setupVideo();
    setCameraNearPlane();
    // setupRenderer();

    addEventListeners();
}

async function loadPosenet() {
    net = await posenet.load();
}

async function getHeadPosition() {
    try {
        video.play();
        const pose = await net.estimateSinglePose(video, { flipHorizontal });
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

export function setupRenderer() {
    const container = document.getElementById('container');
    // renderer = new THREE.WebGLRenderer({ antialias: true });
    //use high performance
    renderer = new THREE.WebGLRenderer({powerPreference: "high-performance"});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    // renderer.setAnimationLoop(parallaxAnimate);
    renderer.localClippingEnabled = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    container.appendChild(renderer.domElement);
    return renderer;
}

export function setupParallaxScene(_scene) {
    scene = _scene;
}


export function setupParallaxCameras() {
    console.log('setupParallaxCameras');
    orbitalCamera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 5000);
    // orbitalCamera.position.set(0, 75, 160);
    // orbitalCamera.target.set(0, 3, 0);
    orbitalCamera.position.set(0, 5, 20);
    // orbitalCamera.rotation.set(0.5, 0, 0);
    // orbitalCamera.lookAt(new THREE.Vector3(0, 4, 0));
    console.log(orbitalCamera);
    // scene.add(orbitalCamera);

    gameCamera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 5000);
    // gameCamera.position.set(0, 75, 160);
    gameCamera.position.set(0, 5, 20);
    // gameCamera.rotation.set(0, 1, 0);

    // gameCamera.lookAt(new THREE.Vector3(0, 4, 0));
    // scene.add(gameCamera);

    frustumHelper = new THREE.CameraHelper(gameCamera);
    // scene.add(frustumHelper);

    bottomLeftCorner = new THREE.Vector3();
    bottomRightCorner = new THREE.Vector3();
    topLeftCorner = new THREE.Vector3();
    return gameCamera;
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
    // window.addEventListener('keydown', onKeyDown);
    // document.getElementById('ParallaxCoefSlider').addEventListener('input', updateParallaxCoef);
    // // document.getElementById('smoothFactorSlider').addEventListener('input', updateSmoothFactor); // New event listener
    // document.getElementById('KalmanRSlider').addEventListener('input', updateKalmanR);
    // document.getElementById('KalmanQSlider').addEventListener('input', updateKalmanQ);
    // document.getElementById('flipHorizontalSwitch').addEventListener('change', updateFlipHorizontal); // New event listener
}

function updateParallaxCoef(event) {
    parallaxCoef = parseFloat(event.target.value);
}

function updateSmoothFactor(event) {
    smoothFactor = parseFloat(event.target.value);
}

function updateKalmanR(event) {
    kalmanR = parseFloat(event.target.value);
    kalmanFilterX.R = kalmanR;
    kalmanFilterY.R = kalmanR;
}

function updateKalmanQ(event) {
    kalmanQ = parseFloat(event.target.value);
    kalmanFilterX.Q = kalmanQ;
    kalmanFilterY.Q = kalmanQ;
}

function updateFlipHorizontal(event) {
    flipHorizontal = event.target.checked;
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

    // console.log(bottomLeftCorner, bottomRightCorner, topLeftCorner);
    CameraUtils.frameCorners(gameCamera, bottomLeftCorner, bottomRightCorner, topLeftCorner, false);
}


function onWindowResize() {
    orbitalCamera.aspect = window.innerWidth / window.innerHeight;
    orbitalCamera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}


function lerp(start, end, t) {
    return start * (1 - t) + end * t;
}


class KalmanFilter {
    constructor({ R, Q, A, B, C }) {
        this.R = R;
        this.Q = Q;
        this.A = A;
        this.B = B;
        this.C = C;

        this.cov = NaN;
        this.x = NaN;
    }

    filter(z, u = 0) {
        if (isNaN(this.x)) {
            this.x = (1 / this.C) * z;
            this.cov = (1 / this.C) * this.Q * (1 / this.C);
        } else {
            const predX = this.A * this.x + this.B * u;
            const predCov = this.A * this.cov * this.A + this.R;

            const K = predCov * this.C * (1 / (this.C * predCov * this.C + this.Q));
            this.x = predX + K * (z - this.C * predX);
            this.cov = predCov - K * this.C * predCov;
        }
        return this.x;
    }
}


async function setCameraToHeadPosition() {
    try {
        if (video.readyState >= 2) {
            const headPos = await getHeadPosition();

            const planeCenter = new THREE.Vector3();
            nearPlane.getWorldPosition(planeCenter);

            // let targetX = planeCenter.x + (-headPos.x + 160) * parallaxCoef;
            // let targetY = planeCenter.y + (-headPos.y + 120) * parallaxCoef;

            // gameCamera.position.x = lerp(gameCamera.position.x, targetX, smoothFactor);
            // gameCamera.position.y = lerp(gameCamera.position.y, targetY, smoothFactor);
            // gameCamera.position.z = planeCenter.z + gameCamera.near;

            const rawX = planeCenter.x + (-headPos.x + 160) * parallaxCoef;
            const rawY = planeCenter.y + (-headPos.y + 120) * parallaxCoef;

            const filteredX = kalmanFilterX.filter(rawX);
            const filteredY = kalmanFilterY.filter(rawY);

            gameCamera.position.x = filteredX;
            gameCamera.position.y = filteredY;
            gameCamera.position.z = planeCenter.z + 1;

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
    // nearPlane.rotation.set(orbitalCamera.rotation.x, orbitalCamera.rotation.y, orbitalCamera.rotation.z);
    nearPlane.rotation.set(0, 0, 0);
    nearPlane.position.set(orbitalCamera.position.x, orbitalCamera.position.y, orbitalCamera.position.z - orbitalCamera.near - 0.1);
    console.log(nearPlane);

    // scene.add(nearPlane);
}

function getNearPlane() {
    console.log(orbitalCamera);
    const near = orbitalCamera.near;
    const fov = orbitalCamera.fov * (Math.PI / 180);
    const aspect = orbitalCamera.aspect;

    const height = 2 * Math.tan(fov / 2) * near;
    const width = height * aspect;
    return { width, height };
}

export function parallaxAnimate() {
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
    setCameraToHeadPosition();
    renderer.xr.enabled = currentXrEnabled;
    renderer.shadowMap.autoUpdate = currentShadowAutoUpdate;
    renderer.setRenderTarget(currentRenderTarget);
}


export function preParallaxAnimate() {
    // const currentRenderTarget = renderer.getRenderTarget();
    // const currentXrEnabled = renderer.xr.enabled;
    // const currentShadowAutoUpdate = renderer.shadowMap.autoUpdate;
    // renderer.xr.enabled = false;
    // renderer.shadowMap.autoUpdate = false;

    if (debugMode) {
        frustumHelper.visible = true;
        nearPlane.visible = true;
    } else {
        frustumHelper.visible = false;
        nearPlane.visible = false;
    }
    renderGame(nearPlane);
}


export function postParallaxAnimate() {
    frustumHelper.update();
    setCameraToHeadPosition();
    // updateCameraPositionMarker();
    // renderer.xr.enabled = true;
    // renderer.shadowMap.autoUpdate = true;
    // renderer.setRenderTarget(renderer.getRenderTarget());
}