import {
    inject,
    bindable
} from 'aurelia-framework';
import {
    EventAggregator
} from 'aurelia-event-aggregator';
import {
    ScoreService
} from 'services/score-service';

@inject(EventAggregator, ScoreService)
export class PlayersCustomElement {


    constructor(eventAggregator, scoreService) {
        this.ea = eventAggregator;
        this.ss = scoreService;
        this.maxLevel = 8;
        this.level = 2;
    }

    resetPlayers() {
        this.players = [];
        this.moves = 0;
        this.levelComplete = false;
        this.players = this.initPlayers();
        this.adjustScale();
        this.ea.publish('keysOn');
    }

    publishStatus() {
        let statusUpdate = {
            'level': this.level,
            'moves': this.moves,
            'best': this.bestScores[this.level]
        }
        this.ea.publish('statusUpdate', statusUpdate);
    }

    initPlayers() {
        let self = this;
        let players = [];
        let allPlayers = [
            { 'name': 'crimson' },
            { 'name': 'darkgreen' },
            { 'name': 'darkorange' },
            { 'name': 'royalblue' },
            { 'name': 'deeppink' },
            { 'name': 'olive' },
            { 'name': 'darkkhaki' },
            { 'name': 'silver' },
            { 'name': 'gold' }
        ];
        let startPositions = [
            [], [],// dummy for levels 0, 1
            [[5, 5], [13, 13]],
            [[5, 5], [9, 9], [13, 13]],
            [[5, 5], [13, 5], [5, 13], [13, 13]],
            [[5, 5], [13, 5], [5, 13], [13, 13], [9, 9]],
            [[5, 5], [9, 5], [13, 5], [5, 13], [9, 13], [13, 13]],
            [[5, 5], [9, 5], [13, 5], [9, 9], [5, 13], [9, 13], [13, 13]],
            [[5, 5], [9, 5], [13, 5], [5, 9], [13, 9], [5, 13], [9, 13], [13, 13]],
            [[5, 5], [9, 5], [13, 5], [5, 9], [9, 9], [13, 9], [5, 13], [9, 13], [13, 13]],
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
        };
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

        this.ea.publish('panZoom', { 'panBox': panBox, 'scale': scale });
    }

    allTogether() {
        let self = this;
        // if (!(this.moves & 1)) return true;
        let firstPlayer = self.players[0];
        for (let i = 1; i < self.players.length; i++) {
            if (self.players[i].x !== firstPlayer.x) {
                return false;
            }
            if (self.players[i].y !== firstPlayer.y) {
                return false;
            }
        }
        return true;
    }

    saveScore() {
        let self = this;
        let currentBest = self.bestScores[self.level];
        if (currentBest) {
            currentBest = (self.moves < currentBest) ? self.moves : currentBest;
        } else {
            currentBest = self.moves;
        }
        self.bestScores[self.level] = currentBest;
        self.ss.saveScores(self.bestScores);
    }

    addListeners() {
        let self = this;
        self.ea.subscribe('movePlayer', response => {
            self.movePlayer(response);
        });
        self.ea.subscribe('restart', response => {
            self.resetPlayers();
            self.publishStatus();
        });
    }

    attached() {
        let self = this;
        self.bestScores = self.ss.getScores();
        console.log(self.bestScores);
        self.resetPlayers();
        self.ea.subscribe('keyPressed', response => {
            let self = this;
            self.moves += 1;
            self.publishStatus();
            for (let i = 0; i < self.players.length; i++) {
                self.ea.publish('checkWall', { direction: response, player: self.players[i] });
            }
            // let wait = setTimeout(function () {
            if (self.allTogether() && !self.levelComplete) {
                self.levelComplete = true;
                self.ea.publish('keysOff');
                self.saveScore();
                self.publishStatus();
                self.ea.publish('allTogether');
                if (self.level <= self.maxLevel) {
                    self.level += 1;
                }
            }
            self.adjustScale();
            // }, 300);
        });
        self.addListeners();
        self.publishStatus();
    }

}
