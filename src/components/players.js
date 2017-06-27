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
            console.log(response);
            if (this.areTogether()) {
                this.ea.publish('allTogether');
            }
            if (response.player.name == 'white') {
                this.adjustScale();
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
                step: false,
                x: 5,
                y: 5
            },
            {
                name: 'white',
                step: false,
                x: 13,
                y: 13
            }
        ];
        this.adjustScale();
    }

    stepClass(player) {
        let stepClass = (player.step) ? 'step ' : 'nostep ';
        return stepClass + player.name;
    }

    adjustScale() {
        let minX = Math.min.apply(Math, this.players.map(function (o) { return o.x; }));
        let maxX = Math.max.apply(Math, this.players.map(function (o) { return o.x; }));
        let minY = Math.min.apply(Math, this.players.map(function (o) { return o.y; }));
        let maxY = Math.max.apply(Math, this.players.map(function (o) { return o.y; }));
        let panBoxPadding = 3;
        let panBox = {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            width: 0,
            height: 0,
            centerX: 0,
            centerY: 0,
            size: 0
        };
        panBox.top = Math.max(minY - panBoxPadding, 0);
        panBox.right = Math.min(maxX + panBoxPadding + 1, 20);
        panBox.bottom = Math.min(maxY + panBoxPadding + 1, 20);
        panBox.left = Math.max(minX - panBoxPadding, 0);

        panBox.width = panBox.right - panBox.left;
        panBox.height = panBox.bottom - panBox.top;

        panBox.size = Math.max(panBox.width, panBox.height);
        let scale = Math.min(12.5 / panBox.size, 1);

        panBox.centerX = (panBox.right + panBox.left) / 2;
        panBox.centerY = (panBox.bottom + panBox.top) / 2;
        // console.log(panBox.centerX, panBox.centerY);

        this.ea.publish('scaleChange', scale);
        this.ea.publish('centerChange', panBox);
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
        console.log(response);
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
                self.players[0].step = !response.player.step;
            } else {
                self.players[1].x += xy[0];
                self.players[1].y += xy[1];
                self.players[1].step = !response.player.step;
            }
        };
        if (directions.hasOwnProperty(response.direction)) {
            move(directions[response.direction]);
        }
    }

    attached() {
        this.resetPlayers();
        this.adjustScale();
    }

}
