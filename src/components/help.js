import {
    inject,
    bindable
} from 'aurelia-framework';
import {
    EventAggregator
} from 'aurelia-event-aggregator';

@inject(EventAggregator)
export class HelpCustomElement {

    constructor(eventAggregator) {
        this.ea = eventAggregator;
        this.showHelp = true;
    }

    addEventListeners() {
        this.ea.subscribe('showHelp', response => {
            this.showHelp = true;
        });
    }

    startGame() {
        this.ea.publish('start');
        this.showHelp = false;
    }

    attached() {
        this.addEventListeners();
    }

}
