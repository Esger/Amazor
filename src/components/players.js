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
        this.ea.subscribe('keyPressed', response => {
            for (let i = 0; i < this.players.length; i++) {
                this.ea.publish('checkWall', { direction: response, player: this.players[i] });
            }
        });
        this.ea.subscribe('movePlayer', response => {
            this.movePlayer(response);
            this.adjustScale();
            if (this.areTogether()) {
                this.ea.publish('allTogether');
            }
        });
        this.ea.subscribe('restart', response => {
            this.resetPlayers();
        });

        this.players = [];
    }

    resetPlayers() {
        this.players = [
            {
                name: 'black',
                x: 5,
                y: 5
            },
            {
                name: 'white',
                x: 14,
                y: 14
            }
        ];
    }

    adjustScale() {
        let minX = Math.min.apply(Math, this.players.map(function (o) { return o.x; }));
        let maxX = Math.max.apply(Math, this.players.map(function (o) { return o.x; }));
        let minY = Math.min.apply(Math, this.players.map(function (o) { return o.y; }));
        let maxY = Math.max.apply(Math, this.players.map(function (o) { return o.y; }));
        let dX = maxX - minX;
        let centerX = Math.ceil((maxX + minX) / 2);
        let centerY = Math.ceil((maxY + minY) / 2);
        let dY = maxY - minY;
        let dMax = Math.max(dX, dY);
        let scale = Math.round(9 / dMax * 10) / 10;
        this.ea.publish('scaleChange', scale);
        this.ea.publish('centerChange', { 'centerX': centerX, 'centerY': centerY });
    }

    areTogether() {
        let firstPlayer = this.players[0];
        for (let i = 1; i < this.players.length; i++) {
            if (this.players[i].x !== firstPlayer.x) {
                return false;
            }
            if (this.players[i].y !== firstPlayer.y) {
                return false;
            }
        }
        return true;
    }

    movePlayer(response) {
        let self = this;
        let directions = {
            'left': [-1, 0],
            'right': [+1, 0],
            'up': [0, -1],
            'down': [0, +1]
        };
        let move = function (xy) {
            if (response.player.name == 'black') {
                self.players[0].x += xy[0];
                self.players[0].y += xy[1];
            } else {
                self.players[1].x += xy[0];
                self.players[1].y += xy[1];
            }
        };
        if (directions.hasOwnProperty(response.direction)) {
            move(directions[response.direction]);
        }
    }

    attached() {
        this.resetPlayers();
    }

}
