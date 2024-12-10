// js/Background.js
import * as THREE from 'https://unpkg.com/three@0.126.1/build/three.module.js';

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

    // 添加格線
    const gridSize = 100;
    const gridDivisions = 100;
    const gridHelper = new THREE.GridHelper(gridSize, gridDivisions, 0xffffff, 0x555555);
    gridHelper.position.y = 0.01; // 稍微抬高以避免與地面重疊
    scene.add(gridHelper);

    return scene;
}

export function createCamera() {
    const camera = new THREE.PerspectiveCamera(
        75, 
        window.innerWidth / window.innerHeight, 
        0.1, 
        1000
    );
    return camera;
}
