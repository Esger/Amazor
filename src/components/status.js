import {
    inject,
    bindable
} from 'aurelia-framework';
import {
    EventAggregator
} from 'aurelia-event-aggregator';

@inject(EventAggregator)
export class StatusCustomElement {

    constructor(eventAggregator) {
        this.ea = eventAggregator;
        this.level = 0;
        this.moves = 0;
        this.best = null;
    }

    attached() {
        this.subscriber = this.ea.subscribe('statusUpdate', response => {
            this.level = response.level;
            this.moves = response.moves;
            this.best = response.best;
        });
    }

    detached() {
        this.subscriber.dispose();
    }

    resetHighScore() {
        this.ea.publish('resetHighScore', this.level);
    }

}