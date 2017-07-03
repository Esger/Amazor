export class ScoreService {

    constructor() {
        this.scores = {};
    }

    getScores() {
        let scores = localStorage.getItem('amazorgy-scores');
        if (scores) {
            return JSON.parse(scores);
        } else {
            return [];
        }
    }

    saveScores(scores) {
        console.log(scores);
        if (scores) {
            this.scores = JSON.stringify(scores);
            localStorage.setItem('amazorgy-scores', this.scores);
            console.log(this.scores);
        }
    }

}