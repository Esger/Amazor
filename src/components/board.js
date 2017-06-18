import {
    inject,
    bindable
} from 'aurelia-framework';
import {
    EventAggregator
} from 'aurelia-event-aggregator';

@inject(EventAggregator)
export class BoardCustomElement {

    constructor(eventAggregator) {
        this.ea = eventAggregator;
        this.gamePosition = {
            x: -40,
            y: -40
        };
        this.ea.subscribe('keyPressed', response => {
            this.move(response);
        });
    }

    move(direction) {
        switch (direction) {
            case 'left':
                this.moveMaze(-1, 0);
                break;
            case 'right':
                this.moveMaze(1, 0);
                break;
            case 'up':
                this.moveMaze(0, -1);
                break;
            case 'down':
                this.moveMaze(0, 1);
                break;
            default:
        }
    }

    moveMaze(x, y) {
        let self = this;
        this.gamePosition.x += 4 * x;
        this.gamePosition.y += 4 * y;
    }

}
