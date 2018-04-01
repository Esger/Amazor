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
        this.isTouch = false;
        this.resetBoard();
        this.ea.subscribe('panZoom', response => {
            this.panZoomMaze(response);
        });
        this.ea.subscribe('reset', () => {
            this.resetBoard();
        });
        this.ea.subscribe('isTouch', () => {
            this.isTouch = true;
        });
    }

    handleEvent(event) {
        let board = $(event.target);
        let boardSize = board.height();
        var clickX, clickY;
        if (event.layerX) {
            clickX = event.layerX;
            clickY = event.layerY;
        } else {
            let offset = board.offset();
            let touch = event.touches[0];
            clickX = touch.pageX - offset.left;
            clickY = touch.pageY - offset.top;
        }
        // Diagonals: y = x and y = h - x -> (hMinX)
        let directions = ['down', 'left', 'right', 'up'];
        let upRight = clickY < clickX;
        let upLeft = clickY < boardSize - clickX;
        let direction = directions[upLeft * 1 + upRight * 2];

        this.ea.publish('keyPressed', direction);
        this.ea.publish('disableTiltcontrol');
    }

    handleTouch(event) {
        if (this.isTouch) {
            this.handleEvent(event);
        }
    }

    handleClick(event) {
        if (!this.isTouch) {
            this.handleEvent(event);
        }
    }

    panZoomMaze(response) {
        let self = this;
        let boardSize = 80;
        let scale = (response.scale > 1) ? 1 : response.scale;
        let mazeSize = 128 * scale;
        let minGamePosition = 0;
        let maxGamePosition = boardSize - mazeSize;

        let boardCenter = 6.25 * 6.4;
        let moveX = boardCenter - response.panBox.centerX * scale * 6.4;
        let moveY = boardCenter - response.panBox.centerY * scale * 6.4;
        let setValues = function () {
            self.gamePosition.x = Math.max(Math.min(moveX, minGamePosition), maxGamePosition);
            self.gamePosition.y = Math.max(Math.min(moveY, minGamePosition), maxGamePosition);
            self.scale = scale;
        };
        let wait = setTimeout(setValues, 0);
    }

    resetBoard() {
        this.gamePosition = {
            x: -3,
            y: -3
        };
        this.scale = 1;
        this.ea.publish('enableTiltcontrol');
    }

    attached() {
        this.resetBoard();
    }

}
