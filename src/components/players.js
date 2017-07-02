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

        const MAXLEVEL = 5;

        this.ea = eventAggregator;
        this.ea.subscribe('keyPressed', response => {
            let self = this;
            for (let i = 0; i < this.players.length; i++) {
                this.ea.publish('checkWall', { direction: response, player: this.players[i] });
            }
            let wait = setTimeout(function () {
                if (self.areTogether()) {
                    self.ea.publish('allTogether');
                    if (self.level <= MAXLEVEL) {
                        self.level += 1;
                        console.log('level:', self.level);
                    }
                }
                self.adjustScale();
            }, 200);
            this.moves += 1;
            console.log('moves:', this.moves);
        });
        this.ea.subscribe('movePlayer', response => {
            this.movePlayer(response);
        });
        this.level = 2;
        this.ea.subscribe('restart', response => {
            this.resetPlayers();
        });
        this.players = [];
        this.moves = 0;
    }

    resetPlayers() {
        let self = this;
        this.players = self.initPlayers();
        self.adjustScale();
    }

    initPlayers() {
        let self = this;
        let players = [];
        let allPlayers = [
            // {}, // dummy for level 0
            { 'name': 'crimson' },
            { 'name': 'darkgreen' },
            { 'name': 'darkorange' },
            { 'name': 'royalblue' },
            { 'name': 'olive' },
            { 'name': 'gold' }
        ];
        let startPositions = [
            [], [],// dummy for level 0, 1
            [[5, 5], [13, 13]],
            [[5, 5], [9, 9], [13, 13]],
            [[5, 5], [13, 5], [5, 13], [13, 13]],
            [[5, 5], [13, 5], [5, 13], [13, 13], [9, 9]],
            [[5, 5], [9, 5], [13, 5], [5, 13], [9, 13], [13, 13]]
        ];

        for (var i = 0; i < this.level; i++) {
            let player = allPlayers[i]
            player.x = startPositions[self.level][i][0];
            player.y = startPositions[self.level][i][1];
            player.angle = 90;
            player.step = false;
            players.push(player);
        };

        return players;
    };

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

    attached() {
        this.resetPlayers();
    }

}
