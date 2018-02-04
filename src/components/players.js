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
        this.level = 3;
        this.directions = {
            'up': [0, -1],
            'right': [+1, 0],
            'down': [0, +1],
            'left': [-1, 0]
        };
        this.angles = {
            'up': -90,
            'right': 0,
            'down': 90,
            'left': 180
        };
        this.directionToPlayer = undefined;
    }

    resetPlayers() {
        this.players = [];
        this.moves = 0;
        this.allMoves = 0;
        this.levelComplete = false;
        this.players = this.initPlayers();
        this.adjustScale();
    }

    publishStatus() {
        let statusUpdate = {
            'level': this.level,
            'moves': this.moves,
            'best': this.bestScores[this.level]
        };
        this.ea.publish('statusUpdate', statusUpdate);
    }

    initPlayers() {
        let self = this;
        let players = [];
        const allPlayers = [
            { 'name': 'red' },
            { 'name': 'limegreen' },
            { 'name': 'badBoy' },
            { 'name': 'orange' },
            { 'name': 'dodgerblue' },
            { 'name': 'deeppink' },
            { 'name': 'yellowgreen' },
            { 'name': 'darkkhaki' },
            { 'name': 'silver' },
            { 'name': 'gold' }
        ];
        const startPositions = [
            [], [],// dummy for levels 0, 1
            [[5, 5], [13, 13]],
            [[5, 5], [13, 13], [9, 9]],
            [[5, 5], [13, 5], [5, 13], [13, 13]],
            [[5, 5], [13, 5], [9, 9], [5, 13], [13, 13]],
            [[5, 5], [9, 5], [13, 5], [5, 13], [9, 13], [13, 13]],
            [[5, 5], [9, 5], [9, 9], [13, 5], [5, 13], [9, 13], [13, 13]],
            [[5, 5], [9, 5], [13, 5], [5, 9], [13, 9], [5, 13], [9, 13], [13, 13]],
            [[5, 5], [9, 5], [9, 9], [13, 5], [5, 9], [13, 9], [5, 13], [9, 13], [13, 13]],
        ];

        for (var i = 0; i < this.level; i++) {
            let player = allPlayers[i];
            if (player.name !== 'badBoy') {
                player.maxCheer = 0.15;
                player.cheerInterval = 100;
                player.cheers = () => {
                    if (player.together) {
                        let angle = Math.random() * 2 * Math.PI;
                        player.xCheer = Math.cos(angle) * player.maxCheer;
                        player.yCheer = Math.sin(angle) * player.maxCheer;
                    }
                };
                player.cheer = setInterval(player.cheers, player.cheerInterval);
            }
            player.x = startPositions[self.level][i][0];
            player.y = startPositions[self.level][i][1];
            player.angle = 90;
            player.step = false;
            player.together = false;
            players.push(player);
        }

        return players;
    }

    findPlayerPathsToBadGuy() {
        let badBoys = this.players.filter(player => {
            return player.name == 'badBoy';
        });
        let others = this.players.filter(player => {
            return player.name !== 'badBoy';
        });
        let targetPositions = others.map(player => {
            return [player.x, player.y];
        });
        badBoys.forEach(badboy => {
            this.ea.publish('getDirection', {
                player: badboy,
                targetPositions: targetPositions
            });
        });
    }

    movePlayer(response) {
        let self = this;
        let move = function (xy) {
            let playerIndex = self.players.findIndex(player => player.name == response.player.name);
            let player = self.players[playerIndex];
            player.x += xy[0];
            player.y += xy[1];
            player.step = !self.players[playerIndex].step;
            player.angle = self.angles[response.direction];
        };
        if (self.directions.hasOwnProperty(response.direction)) {
            self.allMoves++;
            move(self.directions[response.direction]);
        }
    }

    adjustScale() {
        let xCoordinates = this.players.map(function (o) { return o.x; });
        let yCoordinates = this.players.map(function (o) { return o.y; });
        let minX = Math.min(...xCoordinates);
        let maxX = Math.max(...xCoordinates);
        let minY = Math.min(...yCoordinates);
        let maxY = Math.max(...yCoordinates);
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

    // Set the together property for player in players array
    // when they share the same x and y property
    tagTogether() {
        let self = this;
        for (var i = 0; i < self.players.length - 1; i++) {
            let firstPlayer = self.players[i];
            for (let j = i + 1; j < self.players.length; j++) {
                let thisPlayer = self.players[j];
                if (thisPlayer.x == firstPlayer.x && thisPlayer.y == firstPlayer.y) {
                    firstPlayer.together = true;
                    thisPlayer.together = true;
                }
            }
        }
    }

    // If all players have together property set then return true
    allTogether() {
        let self = this;
        let isTogether = player => {
            return player.together && player.name !== 'badBoy';
        };
        return self.players.filter(isTogether).length >= self.players.length - 1;
    }

    gotCought() {
        let self = this;
        let oneBadGuy = () => {
            return self.players.filter(player => {
                return player.together && player.name == 'badBoy';
            }).length == 1;
        };
        return oneBadGuy();
    }

    // If at least one player has moved, increase moves
    addMove() {
        let self = this;
        if (Math.ceil(self.allMoves / self.level) == 1) {
            self.moves++;
        }
        self.allMoves = 0;
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
        // move a badboy in calculated direction
        self.ea.subscribe('directionToPlayer', response => {
            this.movePlayer({ direction: response.direction, player: response.player });
        });
        self.ea.subscribe('restart', () => {
            self.resetPlayers();
            self.publishStatus();
        });
    }

    attached() {
        let self = this;
        self.bestScores = self.ss.getScores();
        self.resetPlayers();
        self.ea.subscribe('keyPressed', response => {
            self.findPlayerPathsToBadGuy();
            self.players.forEach((player) => {
                self.ea.publish('checkWall', {
                    direction: response,
                    player: player
                });
            });
            self.tagTogether();
            self.addMove();
            self.publishStatus();
            if (self.gotCought()) {
                self.ea.publish('stop');
                self.levelComplete = false;
                self.ea.publish('gotCought');
            } else if (self.allTogether() && !self.levelComplete) {
                self.levelComplete = true;
                self.ea.publish('stop');
                self.saveScore();
                self.publishStatus();
                self.ea.publish('allTogether');
                if (self.level <= self.maxLevel) {
                    self.level += 1;
                }
            }
            self.adjustScale();
        });
        self.addListeners();
        self.publishStatus();
    }

}
