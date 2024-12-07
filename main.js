import * as THREE from 'https://unpkg.com/three@0.150.1/build/three.module.js';
import * as CameraUtils from 'https://unpkg.com/three@0.150.1/examples/jsm/utils/CameraUtils.js';
import { TransformControls } from 'https://unpkg.com/three@0.150.1/examples/jsm/controls/TransformControls.js';
import { OrbitControls } from 'https://unpkg.com/three@0.150.1/examples/jsm/controls/OrbitControls.js';

let orbitalCamera, scene, renderer;
let transformControls;
let gameCamera, leftPortal, leftPortalTexture, reflectedPosition,
    bottomLeftCorner, bottomRightCorner, topLeftCorner;
let frustumHelper;
let isPortalCameraActive = false;
let net, video;
let orbitControls;
let planeTexture = new THREE.WebGLRenderTarget(1080, 1080);
let nearPlane;

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

init();

async function init() {
    await loadPosenet();

    const container = document.getElementById('container');

    // renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setAnimationLoop(animate);
    renderer.localClippingEnabled = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    container.appendChild(renderer.domElement);

    // scene
    scene = new THREE.Scene();

    // camera
    orbitalCamera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 5000);
    orbitalCamera.position.set(0, 75, 160);

    // another camera for the portal
    gameCamera = new THREE.PerspectiveCamera(45, 1.0, 0.1, 500.0);
    gameCamera.position.set(0, 75, 160);

    scene.add(gameCamera);
    frustumHelper = new THREE.CameraHelper(gameCamera);

    const planeGeo = new THREE.PlaneGeometry(100.1, 100.1);

    // portals
    frustumHelper = new THREE.CameraHelper(gameCamera);
    scene.add(frustumHelper);
    bottomLeftCorner = new THREE.Vector3();
    bottomRightCorner = new THREE.Vector3();
    topLeftCorner = new THREE.Vector3();
    reflectedPosition = new THREE.Vector3();

    leftPortalTexture = new THREE.WebGLRenderTarget(1080, 1080);
    leftPortal = new THREE.Mesh(planeGeo, new THREE.MeshBasicMaterial({ map: leftPortalTexture.texture }));
    leftPortal.position.x = -30;
    leftPortal.position.y = 20;
    leftPortal.scale.set(0.35, 0.35, 0.35);
    scene.add(leftPortal);

    // ground
    const groundGeo = new THREE.PlaneGeometry(500, 500);
    const groundMat = new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    // lights
    const ambientLight = new THREE.AmbientLight(0x404040); // soft white light
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(50, 50, 50).normalize();
    scene.add(directionalLight);

    // Add transform controls for the portal camera
    transformControls = new TransformControls(orbitalCamera, renderer.domElement);
    transformControls.attach(gameCamera);
    scene.add(transformControls);

    // Add orbital controls
    orbitControls = new OrbitControls(orbitalCamera, renderer.domElement);
    orbitControls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    orbitControls.dampingFactor = 0.25;
    orbitControls.screenSpacePanning = false;
    orbitControls.maxPolarAngle = Math.PI / 2;

    // Disable orbital controls when transform controls are active
    transformControls.addEventListener('mouseDown', function () {
        orbitControls.enabled = false;
    });
    transformControls.addEventListener('mouseUp', function () {
        orbitControls.enabled = true;
    });

    // Add webcam video element
    video = document.createElement('video');
    video.id = 'webcam';
    video.width = 320;
    video.height = 240;
    document.body.appendChild(video);

    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    video.play();

    setCameraNearPlane();


    window.addEventListener('resize', onWindowResize);
    window.addEventListener('keydown', onKeyDown);
}

function renderPortal(thisPortalMesh, thisPortalTexture) {
    if (!thisPortalMesh) return; // Ensure the portal mesh is defined

    // Calculate the corners of the portal in world space
    thisPortalMesh.updateMatrixWorld();
    thisPortalMesh.geometry.computeBoundingBox();
    const bbox = thisPortalMesh.geometry.boundingBox.clone();
    bbox.applyMatrix4(thisPortalMesh.matrixWorld);

    bottomLeftCorner.set(bbox.min.x, bbox.min.y, bbox.min.z);
    bottomRightCorner.set(bbox.max.x, bbox.min.y, bbox.min.z);
    topLeftCorner.set(bbox.min.x, bbox.max.y, bbox.min.z);

    // Frame the corners using CameraUtils
    CameraUtils.frameCorners(gameCamera, bottomLeftCorner, bottomRightCorner, topLeftCorner, false);

    // Render the scene from the portal camera's perspective
    const currentRenderTarget = renderer.getRenderTarget();
    renderer.setRenderTarget(thisPortalTexture);
    renderer.state.buffers.depth.setMask(true); // Ensure the depth buffer is writable
    if (renderer.autoClear === false) renderer.clear();
    thisPortalMesh.visible = false; // Hide this portal from its own rendering
    renderer.render(scene, gameCamera);
    thisPortalMesh.visible = true; // Re-enable this portal's visibility for general rendering
    renderer.setRenderTarget(currentRenderTarget);
}

function renderOffaxis(thisPortalMesh) {
    // Calculate the corners of the portal in world space
    thisPortalMesh.updateMatrixWorld();
    thisPortalMesh.geometry.computeBoundingBox();
    const bbox = thisPortalMesh.geometry.boundingBox.clone();
    bbox.applyMatrix4(thisPortalMesh.matrixWorld);

    bottomLeftCorner.set(bbox.min.x, bbox.min.y, bbox.min.z);
    bottomRightCorner.set(bbox.max.x, bbox.min.y, bbox.min.z);
    topLeftCorner.set(bbox.min.x, bbox.max.y, bbox.min.z);
    thisPortalMesh.visible = false; // Hide this portal from its own rendering
    // Frame the corners using CameraUtils
    CameraUtils.frameCorners(gameCamera, bottomLeftCorner, bottomRightCorner, topLeftCorner, false);
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
            if (isPortalCameraActive) {
                orbitalCamera.position.set(0, 75, 160);
                orbitalCamera.rotation.set(0, 0, 0);
                CameraUtils.frameCorners(orbitalCamera, bottomLeftCorner, bottomRightCorner, topLeftCorner, false);
                orbitalCamera.updateProjectionMatrix();
                isPortalCameraActive = false;
            } else {
                orbitalCamera.position.copy(gameCamera.position);
                orbitalCamera.rotation.copy(gameCamera.rotation);
                orbitalCamera.updateProjectionMatrix();
                isPortalCameraActive = true;
            }
            break;
        case 'h':
            try {
                if (video.readyState >= 2) {
                    const position = await getHeadPosition();
                    // get the center position of portal
                    const portalCenter = new THREE.Vector3();
                    leftPortal.getWorldPosition(portalCenter);
                    // set the portal camera position using head position
                    let posX = portalCenter.x - position.x + 160;
                    let posY = portalCenter.y - position.y + 120;
                    let coef = 0.5;
                    posX *= coef;
                    posY *= coef;
                    gameCamera.position.set(posX, posY, portalCenter.z + 30);
                } else {
                    video.onloadedmetadata = async () => {
                        // position = await getHeadPosition();
                        // console.log('Head Position:', position);
                    };
                }
            } catch (error) {
                console.error('Error getting head position:', error);
            }
            break;
        // case 'v':
        //     // visualizeCameraPlane(orbitalCamera);
        //     break;
    }
}

function visualizeCameraPlane(camera) {
    const near = camera.near;
    const fov = camera.fov * (Math.PI / 180); // convert to radians
    const aspect = camera.aspect;

    const height = 2 * Math.tan(fov / 2) * near;
    const width = height * aspect;
    console.log('Camera height:', height, 'width:', width);

    const planeGeometry = new THREE.PlaneGeometry(width, height);
    const planeMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    console.log('Camera position:', camera.position);
    plane.rotation.set(camera.rotation.x, camera.rotation.y, camera.rotation.z);

    plane.position.set(camera.position.x, camera.position.y, camera.position.z - near);
    scene.add(plane);
    // scene.add(camera);
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

function getNearPlane(){
    const near = orbitalCamera.near;
    const fov = orbitalCamera.fov * (Math.PI / 180); // convert to radians
    const aspect = orbitalCamera.aspect;

    const height = 2 * Math.tan(fov / 2) * near;
    const width = height * aspect;
    return { width, height };
}

function animate() {
    // Save the original camera properties
    const currentRenderTarget = renderer.getRenderTarget();
    const currentXrEnabled = renderer.xr.enabled;
    const currentShadowAutoUpdate = renderer.shadowMap.autoUpdate;
    renderer.xr.enabled = false; // Avoid camera modification
    renderer.shadowMap.autoUpdate = false; // Avoid re-computing shadows

    // renderPortal(leftPortal, leftPortalTexture);
    // use near plane to be the portal
    renderPortal(nearPlane, planeTexture);
    // renderPortal(leftPortal, leftPortalTexture);
    // renderOffaxis();
    if (isPortalCameraActive) {
        renderer.render(scene, gameCamera);
    } else {
        renderer.render(scene, orbitalCamera);
    }

    frustumHelper.update();

    // Update orbital controls
    orbitControls.update();

    // Restore the original rendering properties
    renderer.xr.enabled = currentXrEnabled;
    renderer.shadowMap.autoUpdate = currentShadowAutoUpdate;
    renderer.setRenderTarget(currentRenderTarget);
}