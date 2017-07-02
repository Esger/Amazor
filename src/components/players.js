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
            if (this.areTogether()) {
                this.ea.publish('allTogether');
                if (this.level < this.allPlayers.length - 2) {
                    this.level += 1;
                }
            }
            // No need to adjust scale for every player
            if (response.player.name == this.players[this.players.length - 1].name) {
                this.adjustScale();
                this.moves += 1;
            }
        });
        this.level = 2;
        this.ea.subscribe('restart', response => {
            this.resetPlayers();
        });
        this.allPlayers = [
            { name: 'crimson' },
            { name: 'darkgreen' },
            { name: 'darkorange' },
            { name: 'royalblue' },
            { name: 'olive' },
            { name: 'gold' }
        ];
        this.players = [];
        this.moves = 0;
    }

    resetPlayers() {
        let self = this;
        let levelStartPositions = [
            [], [], // dummy's since level starts at 2
            [[5, 5], [13, 13]],
            [[5, 5], [9, 9], [13, 13]],
            [[5, 5], [13, 5], [5, 13], [13, 13]],
            [[5, 5], [13, 5], [5, 13], [13, 13], [9, 9]],
            [[5, 5], [9, 5], [13, 5], [5, 13], [9, 13], [13, 13]]
        ];
        let setStartPositions = function () {
            for (let i = 0; i < self.level; i++) {
                self.players[i].x = levelStartPositions[self.level][i][0];
                self.players[i].y = levelStartPositions[self.level][i][1];
                self.players[i].angle = 90;
                self.players[i].step = false;
            }
        };
        self.players = self.allPlayers.slice(0, self.level);
        setStartPositions();
        self.adjustScale();
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

        this.ea.publish('scaleChange', scale);
        this.ea.publish('centerChange', panBox);
    }

    areTogether() {
        if (!(this.moves & 1)) return true;
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
            'up': [0, -1],
            'right': [+1, 0],
            'down': [0, +1],
            'left': [-1, 0]
        };
        let angles = {
            'up': -90,
            'right': 0,
            'down': 90,
            'left': 180
        }
        let move = function (xy) {
            let playerIndex = self.players.findIndex(player => player.name == response.player.name);
            self.players[playerIndex].x += xy[0];
            self.players[playerIndex].y += xy[1];
            self.players[playerIndex].step = !self.players[playerIndex].step;
            self.players[playerIndex].angle = angles[response.direction]
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
