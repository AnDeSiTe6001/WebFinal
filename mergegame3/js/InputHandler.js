// js/InputHandler.js
import * as THREE from 'https://unpkg.com/three@0.150.1/build/three.module.js';

export class InputHandler {
    constructor(controls, game) {
        this.controls = controls;
        this.game = game;
        this.init();
    }

    init() {
        // Tab 鍵啟動視角控制
        window.addEventListener('keydown', (event) => {
            if (event.code === 'Tab' && this.game.isStarted) {
                event.preventDefault(); // 禁用 Tab 鍵默認行為
                this.controls.lock();
            }
        });

        // 滑鼠點擊邏輯（擊殺怪物）
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        window.addEventListener('click', (event) => {
            if (this.game.isPaused || this.controls.isLocked) return;

            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            raycaster.setFromCamera(mouse, this.game.camera);

            const intersects = raycaster.intersectObjects(this.game.monsters.map(monster => monster.mesh));
            if (intersects.length > 0) {
                const intersectedMonster = intersects[0].object;
                const monsterIndex = this.game.monsters.findIndex(monster => monster.mesh === intersectedMonster);
                if (monsterIndex !== -1) {
                    this.game.monsters[monsterIndex].remove(this.game.scene); // 移除被擊中的怪物
                    this.game.monsters.splice(monsterIndex, 1);
                    this.game.updateScore(10); // 基礎得分為 10，倍率調整在 updateScore 中處理
                }
            }
        });
    }
}
