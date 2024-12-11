// js/Background.js
import * as THREE from 'https://unpkg.com/three@0.150.1/build/three.module.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.150.1/examples/jsm/loaders/GLTFLoader.js';

export function createBackground() {
    const scene = new THREE.Scene();

    // 添加環境光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // 添加點光源
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(25, 50, 25);
    scene.add(pointLight);

    // 添加地面
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    // 添加坐標軸輔助工具
    const axesHelper = new THREE.AxesHelper(10); // 長度為10的坐標軸
    // scene.add(axesHelper);

    // 添加格線輔助工具
    const gridSize = 100;
    const gridDivisions = 100;
    const gridHelper = new THREE.GridHelper(gridSize, gridDivisions, 0xffffff, 0x555555);
    gridHelper.position.y = 0.01; // 稍微抬高以避免與地面重疊
    scene.add(gridHelper);

    // 添加自定義尺規
    addRuler(scene);

    // 載入3D監獄模型
    const loader = new GLTFLoader();
    loader.load(
        'assets/models/prison/prison_small.glb', // 模型路徑
        (gltf) => {
            const model = gltf.scene;
            model.scale.set(2, 2, 2); // 調整模型大小
            model.position.set(-78, 0, 35); // 調整模型位置，使相機能從門口觀看

            // 調整模型旋轉
            // model.rotation.y = Math.PI; // 繞 Y 軸旋轉 180 度
            

            scene.add(model);
        },
        (xhr) => {
            console.log(`Loading model: ${(xhr.loaded / xhr.total * 100).toFixed(2)}% loaded`);
        },
        (error) => {
            console.error('An error happened while loading the GLB model:', error);
        }
    );

    // 添加方向光以更好地照亮模型
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 50, 0);
    scene.add(directionalLight);

    return scene;
}

function addRuler(scene) {
    const rulerMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
    const rulerGeometry = new THREE.BufferGeometry();
    const points = [];

    // 每隔1個單位添加一條短線
    for (let i = -50; i <= 50; i++) {
        if (i % 5 === 0) { // 每5個單位添加一條較長的線
            points.push(new THREE.Vector3(i, 0.02, -50));
            points.push(new THREE.Vector3(i, 0.02, 50));
        } else {
            points.push(new THREE.Vector3(i, 0.02, -2));
            points.push(new THREE.Vector3(i, 0.02, 2));
        }
    }

    rulerGeometry.setFromPoints(points);
    const rulerLines = new THREE.LineSegments(rulerGeometry, rulerMaterial);
    scene.add(rulerLines);
}

export function createCamera() {
    const camera = new THREE.PerspectiveCamera(
        75, 
        window.innerWidth / window.innerHeight, 
        0.1, 
        1000
    );
    camera.position.set(0, 1.6, 0); // 設置相機位置在門口前方
    camera.lookAt(new THREE.Vector3(1, 1.6, 0)); // 確保相機朝向模型門口
    return camera;
}
