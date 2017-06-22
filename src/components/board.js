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
        this.gamePosition = {};
        this.scale = 1;
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
            this.gamePosition.x = -response.centerX * 6.4;
            this.gamePosition.y = -response.centerY * 6.4;
        });
        this.ea.subscribe('restart', response => {
            this.resetBoard();
        });

    }

    clickBoard(event) {
        let boardSize = $(this.board).height();
        let clickX = event.layerX;
        let clickY = event.layerY;
        let direction = 'undefined';
        if (clickY <= clickX) {
            if (clickY <= (boardSize - clickX)) {
                direction = 'up';
            } else {
                direction = 'right';
            }
        } else {
            if (clickY <= (boardSize - clickX)) {
                direction = 'left';
            } else {
                direction = 'down';
            }
        }
        this.ea.publish('keyPressed', direction);
        console.log(direction);
    }

    moveMaze(xy) {
        let self = this;
        this.gamePosition.x += 4 * xy[0];
        this.gamePosition.y += 4 * xy[1];
    }

    resetBoard() {
        this.gamePosition = {
            x: -64,
            y: -64
        };
        this.scale = 1;
    }

    attached() {
        this.resetBoard();
    }

}
