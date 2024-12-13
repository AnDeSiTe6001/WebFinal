// js/Difficulty.js
export function getDifficultySettings(difficulty) {
    let spawnInterval, monsterSpeed, monsterHealth, scoreMultiplier;
    switch (difficulty) {
        case 'easy':
            spawnInterval = 1.5;
            monsterSpeed = 3;
            monsterHealth = 2;
            scoreMultiplier = 1;
            break;
        case 'normal':
            spawnInterval = 1.5;
            monsterSpeed = 5;
            monsterHealth = 3;
            scoreMultiplier = 2;
            break;
        case 'hard':
            spawnInterval = 1;
            monsterSpeed = 8;
            monsterHealth = 4;
            scoreMultiplier = 3;
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
