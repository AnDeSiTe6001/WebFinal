// js/Wall.js
import * as THREE from 'https://unpkg.com/three@0.126.1/build/three.module.js';

export function createWallWithWindow() {
    const wallGroup = new THREE.Group();

    // 創建牆壁
    const wallGeometry = new THREE.BoxGeometry(50, 10, 1);
    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
    const wall = new THREE.Mesh(wallGeometry, wallMaterial);
    wall.position.set(0, 5, -25); // 放置在 Z 軸 -25 處
    wallGroup.add(wall);

    // 創建窗口
    const windowGeometry = new THREE.BoxGeometry(10, 5, 0.1);
    const windowMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff, transparent: true, opacity: 0.5 });
    const windowMesh = new THREE.Mesh(windowGeometry, windowMaterial);
    windowMesh.position.set(0, 5, -24.95); // 放置在牆壁前方
    wallGroup.add(windowMesh);

    return wallGroup;
}
