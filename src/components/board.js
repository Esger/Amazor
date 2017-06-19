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
        this.gameWon = false;
        this.ea.subscribe('keyPressed', response => {
            let self = this;
            let directions = {
                'left': [1, 0],
                'right': [-1, 0],
                'up': [0, 1],
                'down': [0, -1]
            };
            if (directions.hasOwnProperty(response)) {
                self.moveMaze(directions[response]);
            }
        });
        this.ea.subscribe('allTogether', response => {
            this.gameWon = true;
            console.log(this.gameWon);
        })
    }

    moveMaze(xy) {
        let self = this;
        this.gamePosition.x += 4 * xy[0];
        this.gamePosition.y += 4 * xy[1];
    }

}
