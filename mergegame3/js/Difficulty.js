// js/Difficulty.js
export function getDifficultySettings(difficulty) {
    let spawnInterval, monsterSpeed, monsterHealth, scoreMultiplier;
    switch (difficulty) {
        case 'easy':
            spawnInterval = 1.5;
            monsterSpeed = 3;
            monsterHealth = 2;
            scoreMultiplier = 0.8;
            break;
        case 'normal':
            spawnInterval = 1.5;
            monsterSpeed = 4;
            monsterHealth = 3;
            scoreMultiplier = 1;
            break;
        case 'hard':
            spawnInterval = 1;
            monsterSpeed = 5;
            monsterHealth = 4;
            scoreMultiplier = 1.5;
            break;
        default:
            spawnInterval = 1.5;
            monsterSpeed = 3;
            monsterHealth = 2;
            scoreMultiplier = 1;
            break;
    }
    

    return { spawnInterval, monsterSpeed, monsterHealth, scoreMultiplier };
}
