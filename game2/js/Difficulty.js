// js/Difficulty.js
export function getDifficultySettings(difficulty) {
    let spawnInterval, monsterSpeed, scoreMultiplier;
    switch (difficulty) {
        case '簡單':
            spawnInterval = 1.5;   // 怪物生成間隔
            monsterSpeed = 8;    // 怪物移動速度
            scoreMultiplier = 0.8; // 分數倍率
            break;
        case '普通':
            spawnInterval = 1.5;
            monsterSpeed = 13;
            scoreMultiplier = 1;
            break;
        case '困難':
            spawnInterval = 1;
            monsterSpeed = 25;
            scoreMultiplier = 1.5;
            break;
        default:
            // 預設使用普通難度
            spawnInterval = 1.5;
            monsterSpeed = 13;
            scoreMultiplier = 1;
            break;
    }

    return { spawnInterval, monsterSpeed, scoreMultiplier };
}
