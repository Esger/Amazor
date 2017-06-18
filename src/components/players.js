import {
    inject,
    bindable
} from 'aurelia-framework';
import {
    EventAggregator
} from 'aurelia-event-aggregator';

@inject(EventAggregator)
export class PlayersCustomElement {

    constructor(eventAggregator) {
        this.ea = eventAggregator;
        this.black = {
            x: 5,
            y: 5
        };
        this.white = {
            x: 14,
            y: 14
        };
    }

    positionStyle(color) {
        switch (color) {
            case 'black':
                return "left: " + 4 * this.black.x + "vmin; top:" + 4 * this.black.y + "vmin";
            case 'white':
                return "left: " + 4 * this.white.x + "vmin; top:" + 4 * this.white.y + "vmin";
        }

    }
}
