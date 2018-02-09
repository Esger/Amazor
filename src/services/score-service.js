import {
    inject
} from 'aurelia-framework';
import {
    EventAggregator
} from 'aurelia-event-aggregator';

@inject(EventAggregator)

export class ScoreService {

    constructor(eventAggregator) {
        this.ea = eventAggregator;
        this.scores = {};
        this.ea.subscribe('resetHighScore', response => {
            resetHighScore(response);
        });
    }

    getScores() {
        this.scores = localStorage.getItem('amazor-scores');
        if (this.scores) {
            return JSON.parse(this.scores);
        } else {
            return [];
        }
    }

    saveScores(scores) {
        if (scores) {
            this.scores = JSON.stringify(scores);
            localStorage.setItem('amazor-scores', this.scores);
        }
    }

    resetHighScore(level) {
        this.scores[level] = 0;
        saveScores(this.scores);
    }

}