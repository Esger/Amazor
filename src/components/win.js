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
    }

    addEventListeners() { 
        this.ea.subscribe('allTogether', response => {
            this.showWin = true;
        });
    }

    restart() {
        this.ea.publish('restart');
        this.ea.publish('keysOn');
        this.showWin = false;
    }

    attached() { 
        this.addEventListeners();
    }

}
