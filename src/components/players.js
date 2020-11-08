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

		this.acceptMoves = false;
		this.maxLevel = 14;
		this.level = 0; //0
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
		this.players = [];

		this.goodGuys = [];
		this.badBoys = [];
	}

	addListeners() {

		this._keyPressedSubscription = this.ea.subscribe('keyPressed', response => {
			this.moveAll(response);
		});

		this._moveSubscription = this.ea.subscribe('direction', response => {
			this.moveAll(response);
		});

		this._resetSubscription = this.ea.subscribe('reset', () => {
			if (this.levelComplete && this.level < this.maxLevel) {
				this.level += 1;
			}
			this.resetPlayers();
			this.publishStatus();
		});

		this._movePlayerSubscription = this.ea.subscribe('movePlayer', response => {
			// response = {direction, player}
			this.movePlayer(response);
		});

		this._moveBadBoySubscription = this.ea.subscribe('moveBadBoy', response => {
			// response = {direction, player}
			this.mws.getDirection(response.player, this.targetPositions);
		});

		// move a badboy in direction of nearest goodGuy
		this._directionToPlayerSubscription = this.ea.subscribe('directionToPlayer', response => {
			// response = {direction, player}
			this.movePlayer(response);
		});

		this._checkGameEndSubscription = this.ea.subscribe('checkGameEnd', () => {
			this.checkGameEnd();
		});

		this._updateStatusSubscription = this.ea.subscribe('updateStatus', () => {
			this.publishStatus();
		});

		this._stopSubscription = this.ea.subscribe('stop', response => {
			this.rejectInput();
		});

		this._startSubscription = this.ea.subscribe('start', response => {
			this.acceptInput();
		});
	}

	rejectInput() {
		this.acceptMoves = false;
	}

	acceptInput() {
		this.acceptMoves = true;
	}

	movePlayer(response) {
		const move = xy => {
			const player = this.players[response.player.id];
			player.x += xy[0];
			player.y += xy[1];
			player.step = player.step;
			player.angle = this.angles[response.direction];
		};
		if (this.directions.hasOwnProperty(response.direction)) {
			this.allMoves++;
			move(this.directions[response.direction]);
			this.ea.publish('checkGameEnd');
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
			return i >= startPositions[this.level].length - levelBadBoysCount[this.level];
		};

		startPositions[this.level].forEach((position, playerIndex, positions) => {
			let player = {};
			player.id = playerIndex;
			player.x = startCoordinates[position][0];
			player.y = startCoordinates[position][1];
			player.angle = 90;
			player.step = false;
			player.together = false;
			if (isBadboy(playerIndex)) {
				player.name = 'badBoy';
				player.last = (playerIndex == positions.length - 1);
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
				player.last = (playerIndex == positions.length - levelBadBoysCount[this.level] - 1);
			}
			players.push(player);
		});

		this.goodGuys = players.filter(player => {
			return player.name !== 'badBoy';
		});
		this.badBoys = players.filter(player => {
			return player.name == 'badBoy';
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

	// If all players have together property set then return true
	allTogether() {
		let hotSpot = {
			x: this.goodGuys[0].x,
			y: this.goodGuys[0].y
		};
		let onHotSpot = player => {
			return (player.x == hotSpot.x && player.y == hotSpot.y);
		};
		return this.goodGuys.every(onHotSpot);
	}

	gotCought() {

		let together = badBoy => {
			let onBadSpot = goodGuy => {
				return (goodGuy.x == badBoy.x && goodGuy.y == badBoy.y);
			};
			return this.goodGuys.some(onBadSpot);
		};

		return this.badBoys.some(together);
	}

	tagTogether() {
		let comparePositionToOthers = (thisPlayer, others) => {
			thisPlayer.together = others.forEach(player => {
				let together = (player.x == thisPlayer.x && player.y == thisPlayer.y);
				if (together) {
					player.together = together || player.together;
					thisPlayer.together = together || thisPlayer.together;
				}
			});
			if (others.length > 1) {
				comparePositionToOthers(others[0], others.slice(1));
			}
		};
		comparePositionToOthers(this.goodGuys[0], this.goodGuys.slice(1));
	}

	// If at least one player has moved, increase moves
	addMove() {
		if (Math.ceil(this.allMoves / this.players.length) == 1) {
			this.moves++;
		}
		this.allMoves = 0;
	}

	saveScore() {
		let currentBest = this.bestScores[this.level];
		if (currentBest) {
			currentBest = (this.moves < currentBest) ? this.moves : currentBest;
		} else {
			currentBest = this.moves;
		}
		this.bestScores[this.level] = currentBest;
		this.ss.saveScores(this.bestScores);
	}

	checkGameEnd() {
		this.tagTogether();
		if (this.gotCought()) {
			this.ea.publish('stop');
			this.levelComplete = false;
			this.ea.publish('gotCought');
		} else if (this.allTogether() && !this.levelComplete) {
			this.levelComplete = true;
			this.ea.publish('stop');
			this.saveScore();
			this.ea.publish('allTogether');
		}
	}

	moveAll(direction) {
		if (this.acceptMoves) {
			this.players.forEach((player) => {
				this.ea.publish('checkWall', {
					direction: direction,
					player: player
				});
				if (player.name !== 'badBoy' && player.last) this.setTargetPositions();
			});
			this.addMove();
			this.publishStatus();
			this.adjustScale();
			this.ea.publish('checkGameEnd');
		}
	}

	attached() {
		this.resetPlayers();
		this.bestScores = this.ss.getScores();
		this.addListeners();
		setTimeout(_ => {
			this.publishStatus();
		});
	}

	detached() {
		this._keyPressedSubscription.dispose();
		this._moveSubscription.dispose();
		this._resetSubscription.dispose();
		this._movePlayerSubscription.dispose();
		this._moveBadBoySubscription.dispose();
		this._directionToPlayerSubscription.dispose();
		this._checkGameEndSubscription.dispose();
		this._updateStatusSubscription.dispose();
		this._stopSubscription.dispose();
		this._startSubscription.dispose();
	}

}
