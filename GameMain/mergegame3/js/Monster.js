// js/Monster.js
import * as THREE from 'https://unpkg.com/three@0.150.1/build/three.module.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.150.1/examples/jsm/loaders/GLTFLoader.js';

export class Monster {
    constructor(scene, speed = 5, playerPosition = new THREE.Vector3(0,0,0), playerDirection = new THREE.Vector3(0,0,-1), onLoadCallback = () => {}) {
        this.scene = scene;
        this.speed = speed;
        this.loader = new GLTFLoader();
        this.mixer = null;
        this.mesh = null;
        this.onLoadCallback = onLoadCallback;

        const distance = 40; 
        const angle = (Math.random() * (Math.PI / 2)) - (Math.PI / 4); // -90° 到 +90°
        const x = Math.sin(angle) * distance;
        const z = -Math.cos(angle) * distance;
        this.position = new THREE.Vector3(x, 0, z);
        this.direction = new THREE.Vector3()
            .subVectors(playerPosition, this.position)
            .normalize(); // playerPosition 需同步為相機位置


        this.loadModel();
    }

    loadModel() {
        this.loader.load(
            'assets/models/monster/zombie.glb', 
            (gltf) => {
                this.mesh = gltf.scene;
                console.log('Loaded Monster Mesh:', this.mesh);

                // 若模型太大，微調縮放比例
                const scale = 0.015 + Math.random() * 0.015; // 隨機大小範圍為 0.015 至 0.025
                this.mesh.scale.set(scale, scale, scale);

                // 設定 userData.monster，保留原材質不改動
                this.mesh.traverse((child) => {
                    if (child.isMesh) {
                        child.frustumCulled = false;
                        child.material.side = THREE.DoubleSide;
                        child.userData.monster = this;
                    }
                });
                

                // 將模型中心移至(0,0,0)
                this.mesh.updateMatrixWorld(true);
                const box = new THREE.Box3().setFromObject(this.mesh);
                const size = new THREE.Vector3();
                const center = new THREE.Vector3();
                box.getSize(size);
                box.getCenter(center);

                this.mesh.position.sub(center);
                this.mesh.position.y = size.y / 2; // 貼地高度

                // 底部貼地：以 box.min.y 為基準
                // 若發現仍然漂浮，可直接手動微調 offset 
                const minY = box.min.y;
                this.mesh.position.y -= minY; 
                // 如果仍嫌太高或太低可加減
                this.mesh.position.y -= 7; // 根據需要微調
                this.mesh.position.add(this.position);

                // 如果模型是「趴著」，可嘗試旋轉修正
                // this.mesh.rotation.x = -Math.PI / 2; // 視需要調整模型方向
                
                // 如果有動畫則播放
                if (gltf.animations && gltf.animations.length > 0) {
                    this.mixer = new THREE.AnimationMixer(this.mesh);
                    // 列動畫名稱
                    console.log('Available animations:', gltf.animations.map(clip => clip.name));

                    // 隨機播放44秒動畫片段
                    const clip = gltf.animations[0]; // 單一條44秒的動畫
                    const action = this.mixer.clipAction(clip);
                    
                    // 隨機選擇起始時間(0 ~ clip.duration)
                    action.time = Math.random() * clip.duration;
                    action.setLoop(THREE.LoopRepeat);
                    action.play();

                    // 將 mixer 加入場景，之後在 main.js update 時會更新
                    this.scene.userData.mixers = this.scene.userData.mixers || [];
                    this.scene.userData.mixers.push(this.mixer);
                }

                // 處理動畫
                // if (gltf.animations && gltf.animations.length > 0) {
                //     this.mixer = new THREE.AnimationMixer(this.mesh);
                    
                //     gltf.animations.forEach((clip) => {
                //         const action = this.mixer.clipAction(clip);
                //         this.animations[clip.name] = action;
                //     });

                //     // 播放預設動畫，例如 'Walk'
                //     const defaultAnimationName = 'Walk'; // 根據你的模型動畫名稱調整
                //     if (this.animations[defaultAnimationName]) {
                //         this.animations[defaultAnimationName].play();
                //     }

                //     this.scene.userData.mixers = this.scene.userData.mixers || [];
                //     this.scene.userData.mixers.push(this.mixer);
                // }

                this.scene.add(this.mesh);
                this.onLoadCallback();
            },
            (xhr) => {
                console.log(`Loading monster: ${(xhr.loaded / xhr.total * 100).toFixed(2)}% loaded`);
            },
            (error) => {
                console.error('Error loading monster model:', error);
            }
        );
    }

    update(delta) {
        if (this.mesh) {
            this.mesh.position.add(this.direction.clone().multiplyScalar(this.speed * delta));

            const groundHeight = 0;
            const height = this.getModelHeight();
            this.mesh.position.y = groundHeight + height / 3;

            // 更新動畫
            if (this.mixer) {
                this.mixer.update(delta);
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
            return this.mesh.position.distanceTo(playerPosition) < 2;
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
        }
    }
}
