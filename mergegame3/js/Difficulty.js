// js/Difficulty.js
export function getDifficultySettings(difficulty) {
    let spawnInterval, monsterSpeed, scoreMultiplier;
    switch (difficulty) {
        case 'easy':
            spawnInterval = 1.5;
            monsterSpeed = 3;
            scoreMultiplier = 0.8;
            break;
        case 'normal':
            spawnInterval = 1.5;
            monsterSpeed = 8;
            scoreMultiplier = 1;
            break;
        case 'hard':
            spawnInterval = 1;
            monsterSpeed = 15;
            scoreMultiplier = 1.5;
            break;
        default:
            spawnInterval = 1.5;
            monsterSpeed = 3;
            scoreMultiplier = 1;
            break;
    }
    

    return { spawnInterval, monsterSpeed, scoreMultiplier };
}
