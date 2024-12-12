// js/Monster.js
import * as THREE from 'https://unpkg.com/three@0.150.1/build/three.module.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.150.1/examples/jsm/loaders/GLTFLoader.js';
import { AnimationMixer, AnimationUtils } from 'three';

export class Monster {
    constructor(scene, speed = 5, health = 2, playerPosition = new THREE.Vector3(0, 5, 20), onLoadCallback = () => {}, onRemoveCallback = () => {}) {
        this.scene = scene;
        this.speed = speed;
        this.loader = new GLTFLoader();
        this.mixer = null;
        this.mesh = null;
        this.onLoadCallback = onLoadCallback;
        this.onRemoveCallback = onRemoveCallback; // Add onRemove callback
        this.playerPosition = playerPosition.clone();
        this.collisionDistance = 12; // Use the same stoppingDistance
        this.stoppingDistance = 10; // Adjust as needed
        this.isHit = false; // Add hit state
        this.hitCount = 0; // Initialize hit count
        this.health = health;

        // Calculate spawn position relative to the player's position
        const spawnDistance = 40;
        const spawnAngle = (Math.random() * (Math.PI / 2)) - (Math.PI / 4); // -45° to +45°
        const xOffset = Math.sin(spawnAngle) * spawnDistance;
        const zOffset = -Math.cos(spawnAngle) * spawnDistance;


        this.position = new THREE.Vector3(
            playerPosition.x + xOffset,
            0,
            playerPosition.z + zOffset
        );

        // Calculate direction towards the player
        this.direction = new THREE.Vector3()
            .subVectors(playerPosition, this.position)
            .normalize();

        this.loadModel();
    }

    loadModel() {
        this.loader.load(
            'assets/models/monster/zombie_snapper.glb', 
            (gltf) => {
                this.mesh = gltf.scene;
                // console.log('Loaded Monster Mesh:', this.mesh);

                // 若模型太大，微調縮��比例
                const scale = 0.015 + Math.random() * 0.015; // 隨機大��範圍為 0.015 至 0.025
                this.mesh.scale.set(scale, scale, scale);

                // Set the position of the mesh
                this.mesh.position.copy(this.position);

                // Rotate the monster to face the player
                this.mesh.lookAt(new THREE.Vector3(
                    this.playerPosition.x,
                    this.mesh.position.y,
                    this.playerPosition.z
                ));

                // Add bounding box helper for visualization
                // const boxHelper = new THREE.BoxHelper(this.mesh, 0x00ff00);
                // this.scene.add(boxHelper);
                // this.boxHelper = boxHelper; // Store reference if needed


                const boundingBox = new THREE.Box3().setFromObject(this.mesh);
                const size = new THREE.Vector3();
                boundingBox.getSize(size);

                // Get the center of the bounding box
                const center = new THREE.Vector3();
                boundingBox.getCenter(center);

                // Adjust mesh position so the origin is at the base
                this.mesh.position.y += size.y / 2;

                // Update the bounding box helper
                // this.boxHelper.update();

                // 如果有動畫則播放
                if (gltf.animations && gltf.animations.length > 0) {
                    this.mixer = new AnimationMixer(this.mesh);
                    // console.log('Available animations:', gltf.animations.map(clip => clip.name));

                    const fullClip = gltf.animations[0];

                    // Create subclips for walking and attack animations
                    const walkClip = AnimationUtils.subclip(fullClip, 'Walk', 875, 943); // Frames for walking
                    const attackClip = AnimationUtils.subclip(fullClip, 'Attack', 510, 590); // Frames for attacking
                    const hitClip = AnimationUtils.subclip(fullClip, 'Hit', 384, 429); // Frames for being hit
                    // Walking animation
                    this.walkAction = this.mixer.clipAction(walkClip);
                    this.walkAction.setLoop(THREE.LoopRepeat);
                    this.walkAction.timeScale = 0.2;
                    this.walkAction.play();

                    // Attack animation
                    this.attackAction = this.mixer.clipAction(attackClip);
                    this.attackAction.setLoop(THREE.LoopRepeat);
                    this.attackAction.clampWhenFinished = true;

                    // Hit animation
                    this.hitAction = this.mixer.clipAction(hitClip);
                    this.hitAction.setLoop(THREE.LoopOnce);
                    this.hitAction.clampWhenFinished = true;
                    
                    this.mixer.addEventListener('finished', () => {
                        this.isHit = false;
                        console.log('Hit count:', this.hitCount);
                        if (this.hitCount >= this.health) {
                            this.remove(this.scene); // Remove monster after second hit
                        } else {
                            this.walkAction.reset().play();
                        }
                    });

                    // Add mixer to scene's userData.mixers for updating
                    this.scene.userData.mixers = this.scene.userData.mixers || [];
                    this.scene.userData.mixers.push(this.mixer);
                }

                this.scene.add(this.mesh);
                this.onLoadCallback();
            },
            (xhr) => {
                // console.log(`Loading monster: ${(xhr.loaded / xhr.total * 100).toFixed(2)}% loaded`);
            },
            (error) => {
                console.error('Error loading monster model:', error);
            }
        );
    }

    // Modify hit method
    hit() {
        if (this.hitAction && this.hitCount < this.health) {
            this.hitCount += 1; // Increment hit count
            this.isHit = true;
            this.walkAction.stop();
            this.hitAction.reset().play();
            this.hitAction.clampWhenFinished = true;
        }
    }

    update(delta, playerPosition) {
        if (this.mesh) {
            // Update direction towards the player's current position
            this.direction.subVectors(playerPosition, this.mesh.position).normalize();

            // Calculate distance to player
            const distanceToPlayer = this.mesh.position.distanceTo(playerPosition);

            if (this.isHit) {
                // If hit, update mixer and skip movement
                if (this.mixer) {
                    this.mixer.update(delta);
                }
                return; // Skip the rest of the update
            }

            if (distanceToPlayer > this.stoppingDistance) {
                // Move towards the player
                this.mesh.position.add(this.direction.clone().multiplyScalar(this.speed * delta));
            }

            // Rotate the monster to face the player
            this.mesh.lookAt(new THREE.Vector3(
                playerPosition.x,
                this.mesh.position.y,
                playerPosition.z
            ));

            const groundHeight = 0;
            const height = this.getModelHeight();
            this.mesh.position.y = groundHeight + height / 3;

            // 更新動畫
            if (this.mixer) {
                this.mixer.update(delta);
            }

            // 切換動畫
            if (this.checkCollision(playerPosition)) {
                if (this.walkAction.isRunning()) {
                    this.walkAction.stop();
                    this.attackAction.reset().play();
                }
            } else {
                if (this.attackAction.isRunning()) {
                    this.attackAction.stop();
                    this.walkAction.reset().play();
                }
            }
        }
    }

    getModelHeight() {
        if (this.mesh) {
            const box = new THREE.Box3().setFromObject(this.mesh);
            const size = new THREE.Vector3();
            box.getSize(size);
            return size.y;
        }
        return 1;
    }

    checkCollision(playerPosition) {
        if (this.mesh) {
            const distanceToPlayer = this.mesh.position.distanceTo(playerPosition);
            return distanceToPlayer <= this.collisionDistance;
        }
        return false;
    }

    remove(scene) {
        if (this.mesh) {
            scene.remove(this.mesh);
            if (this.mixer && this.scene.userData.mixers) {
                const index = this.scene.userData.mixers.indexOf(this.mixer);
                if (index > -1) {
                    this.scene.userData.mixers.splice(index, 1);
                }
            }
            this.mesh = null;
            this.onRemoveCallback(); // Invoke the callback when removed
        }
    }
}
