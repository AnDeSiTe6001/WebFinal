// js/Monster.js
import * as THREE from 'https://unpkg.com/three@0.126.1/build/three.module.js';

export class Monster {
    constructor(scene, speed) {
        this.speed = speed || 5; // 默認速度為 5
        const geometry = new THREE.SphereGeometry(0.5, 16, 16);
        const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
        this.mesh = new THREE.Mesh(geometry, material);

        // 怪物生成在 X 軸正向的 -60° 到 +60° 範圍內
        const distance = 50;
        const angle = (Math.random() * (Math.PI / 3)) - (Math.PI / 6); // -60° ~ +60°
        const x = Math.cos(angle) * distance;
        const z = Math.sin(angle) * distance;

        this.mesh.position.set(x, 0.5, z);
        scene.add(this.mesh);

        // 怪物移動方向：朝向原點 (0, 0, 0)
        this.direction = new THREE.Vector3(-x, 0, -z).normalize();
    }

    update(delta) {
        this.mesh.position.add(this.direction.clone().multiplyScalar(this.speed * delta));
    }

    checkCollision(playerPosition) {
        return this.mesh.position.distanceTo(playerPosition) < 1.5;
    }

    remove(scene) {
        scene.remove(this.mesh);
    }
}
