import {
    inject,
    bindable
} from 'aurelia-framework';
import {
    EventAggregator
} from 'aurelia-event-aggregator';
import { ScoreService } from 'services/score-service';
import { MazeWorkerService } from 'services/maze-worker-service';

@inject(EventAggregator, ScoreService, MazeWorkerService)
export class PlayersCustomElement {

    constructor(eventAggregator, scoreService, mazeWorkerService) {
        this.ea = eventAggregator;
        this.ss = scoreService;
        this.mws = mazeWorkerService;

        this.maxLevel = 14;
        this.level = 4; //0
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
        this.startCoordinates = [];
        this.startPositions = [];
        this.targetPositions = [];
        this.goodGuys = [];
    }

    addListeners() {
        let self = this;

        self.ea.subscribe('restart', () => {
            self.resetPlayers();
            self.publishStatus();
        });

        self.ea.subscribe('movePlayer', response => {
            // response = {direction, player}
            self.movePlayer(response);
        });

        self.ea.subscribe('moveBadBoy', response => {
            // response = {direction, player}
            self.mws.getDirection(response.player, self.targetPositions);
        });

        // move a badboy in calculated direction
        self.ea.subscribe('directionToPlayer', response => {
            self.movePlayer({ direction: response.direction, player: response.player });
        });

    }

    movePlayer(response) {
        let self = this;
        let move = function (xy) {
            let player = self.players[response.player.id];
            player.x += xy[0];
            player.y += xy[1];
            player.step = player.step;
            player.angle = self.angles[response.direction];
        };
        if (self.directions.hasOwnProperty(response.direction)) {
            self.allMoves++;
            move(self.directions[response.direction]);
        }
    }

    setTargetPositions() {
        this.targetPositions = this.goodGuys.map(player => {
            return [player.x, player.y];
        });
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
            { 'name': 'orange' },
            { 'name': 'dodgerblue' },
            { 'name': 'deeppink' },
            { 'name': 'yellowgreen' },
            { 'name': 'darkkhaki' },
            { 'name': 'silver' },
            { 'name': 'gold' },
            { 'name': 'badBoy' },
        ];
        const startCoordinates = [
            // arrays of [x,y]
            [5, 5], //0
            [9, 5], //1
            [13, 5], //2
            [5, 9], //3
            [9, 9], //4
            [13, 9], //5
            [5, 13], //6
            [9, 13], //7
            [13, 13] //8
        ];
        const startPositions = [
            // arrays of startCoordinateIndexes
            // 0 | 1 | 2
            // 3 | 4 | 5
            // 6 | 7 | 8
            [0, 8], // 0  
            [0, 8, 4], // 1 
            [1, 6, 8, 4], // 2
            [0, 4, 8, 2, 6], // 3
            [0, 2, 6, 8, 1, 7], // 4
            [0, 2, 7, 1, 6, 8], // 5
            [0, 3, 5, 8, 2, 4, 6], // 6
            [0, 4, 8, 1, 3, 5, 7], // 7
            [1, 3, 5, 7, 0, 2, 6, 8], // 8
            [1, 3, 4, 5, 7, 0, 2, 6, 8], // 9
            [3, 4, 5, 0, 1, 2, 6, 8], // 10
            [1, 3, 5, 7, 0, 2, 4, 6, 8], // 11
            [3, 4, 5, 0, 1, 2, 6, 7, 8], // 12
            [3, 5, 0, 1, 2, 4, 6, 7, 8], // 13
            [2, 6, 0, 1, 3, 4, 5, 7, 8]  // 14
        ];
        const levelBadBoysCount = [
            // Number of badBoys at level
            -1, //0
            1, //1
            1, //2
            2, //3
            2, //4
            3, //5
            3, //6
            4, //7
            4, //8
            4, //9
            5, //10
            5, //11
            6, //12
            7, //13
            7 //14
        ];

        let isBadboy = i => {
            return i >= startPositions[self.level].length - levelBadBoysCount[self.level];
        };

        startPositions[self.level].forEach((position, playerIndex, positions) => {
            let player = {};
            player.id = playerIndex;
            player.x = startCoordinates[position][0];
            player.y = startCoordinates[position][1];
            player.angle = 90;
            player.step = false;
            player.together = false;
            if (isBadboy(playerIndex)) {
                player.name = 'badBoy';
            } else {
                player.name = allPlayers[playerIndex].name;
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
            player.last = (playerIndex == positions.length - levelBadBoysCount[self.level] - 1);
            players.push(player);
        });

        self.goodGuys = players.filter(player => {
            return player.name !== 'badBoy';
        });

        return players;
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
        if (Math.ceil(self.allMoves / self.players.length) == 1) {
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

    attached() {
        let self = this;
        self.resetPlayers();
        self.bestScores = self.ss.getScores();
        self.ea.subscribe('keyPressed', response => {

            self.players.forEach((player) => {
                self.ea.publish('checkWall', {
                    direction: response,
                    player: player
                });
                if (player.last) self.setTargetPositions();
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
