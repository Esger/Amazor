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
        this.ea.subscribe('panZoom', response => {
            this.panZoomMaze(response);
        });
        this.ea.subscribe('restart', response => {
            this.resetBoard();
        });

    }

    handleTouch(event) {
        let board = $(this.board);
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
    }

    attached() {
        this.resetBoard();
    }

}
