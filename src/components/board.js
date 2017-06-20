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
        this.scale = 1;
        this.ea.subscribe('scaleChange', response => {
            this.scale = (response > 1) ? 1 : response;
        });
        this.ea.subscribe('centerChange', response => {
            console.log(response);
            this.gamePosition.x = -response.centerX * 4;
            this.gamePosition.y = -response.centerY * 4;
        });
    }

    moveMaze(xy) {
        let self = this;
        this.gamePosition.x += 4 * xy[0];
        this.gamePosition.y += 4 * xy[1];
    }

}
