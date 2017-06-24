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
        this.scale = 1;
        this.ea.subscribe('scaleChange', response => {
            this.scale = (response > 1) ? 1 : response;
        });
        this.ea.subscribe('centerChange', response => {
            this.moveMaze(response);
        });
        this.ea.subscribe('restart', response => {
            this.resetBoard();
        });

    }

    handleTouch(event) {
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

    moveMaze(panbox) {
        let boardSize = 80;
        let mazeSize = 128 * this.scale;
        let minGamePosition = 0;
        let maxGamePosition = boardSize - mazeSize;

        let boardCenter = 6.25 * 6.4;
        let moveX = boardCenter - panbox.centerX * this.scale * 6.4;
        let moveY = boardCenter - panbox.centerY * this.scale * 6.4;
        this.gamePosition.x = Math.max(Math.min(moveX, minGamePosition), maxGamePosition);
        this.gamePosition.y = Math.max(Math.min(moveY, minGamePosition), maxGamePosition);
        console.log(panbox);
    }

    resetBoard() {
        this.gamePosition = {
            x: -3,
            y: -3
        };
        this.scale = 1;
    }

    attached() {
        this.resetBoard();
    }

}
