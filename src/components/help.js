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
        this.ea.subscribe('start', response => {
            this.showHelp = false;
        });
    }

    startGame(event) {
        event.stopPropagation(); // prevent players moving
        this.ea.publish('start');
    }
    startGameTouch(event) {
        this.ea.publish('isTouch');
        this.startGame(event);
    }

    attached() {
        this.addEventListeners();
    }

}
