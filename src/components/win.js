import {
    inject,
    bindable
} from 'aurelia-framework';
import {
    EventAggregator
} from 'aurelia-event-aggregator';

@inject(EventAggregator)
export class WinCustomElement {

    constructor(eventAggregator) {
        this.ea = eventAggregator;
        this.showWin = false;
        this.showLost = false;
    }

    addEventListeners() {
        this.ea.subscribe('allTogether', response => {
            this.showWin = true;
        });
        this.ea.subscribe('gotCought', response => {
            this.showLost = true;
        });
    }

    restart() {
        this.ea.publish('restart');
        this.ea.publish('keysOn');
        this.showWin = false;
        this.showLost = false;
    }

    attached() {
        this.addEventListeners();
    }

}
