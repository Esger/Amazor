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
            this.resetHighScore(response);
        });
    }

    getScores() {
        let scores = localStorage.getItem('amazor-scores');
        if (scores) {
            this.scores = JSON.parse(scores);
            return this.scores;
        } else {
            return [];
        }
    }

    saveScores(scores) {
        if (scores) {
            this.scores = scores;
            localStorage.setItem('amazor-scores', JSON.stringify(scores));
        }
        this.ea.publish('updateStatus');
    }

    resetHighScore(level) {
        this.scores[level] = 0;
        this.saveScores(this.scores);
        this.ea.publish('updateStatus');
    }

}