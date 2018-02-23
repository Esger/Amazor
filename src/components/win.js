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
        this.ea.subscribe('allTogether', () => {
            this.showWin = true;
        });
        this.ea.subscribe('gotCought', () => {
            this.showLost = true;
        });
        this.ea.subscribe('start', () => {
            this.showLost = false;
            this.showWin = false;
        });
    }

    restart(event) {
        event.stopPropagation();
        this.ea.publish('reset');
        this.ea.publish('start');
        this.showWin = false;
        this.showLost = false;
    }

    attached() {
        this.addEventListeners();
    }

}
