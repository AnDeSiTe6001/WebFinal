// js/Leaderboard.js
export class Leaderboard {
    constructor() {
        this.storageKey = 'highScores';
        this.maxEntries = 5;
    }

    // 獲取高分列表
    getHighScores() {
        const highScores = JSON.parse(localStorage.getItem(this.storageKey)) || [];
        console.log('Current High Scores:', highScores);
        return highScores;
    }

    // 
    updateHighScores(newScore) {
        console.log(`Adding new score: ${newScore}`);
        let highScores = this.getHighScores();
        highScores.push(newScore);
        highScores.sort((a, b) => b - a); // 降序排序
        highScores = highScores.slice(0, this.maxEntries); // 只保留前五名
        localStorage.setItem(this.storageKey, JSON.stringify(highScores));
        console.log('Updated High Scores:', highScores);
        return highScores;
    }

    // 清空高分列表（可選）
    clearHighScores() {
        localStorage.removeItem(this.storageKey);
        console.log('High Scores Cleared');
    }
}
