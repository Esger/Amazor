import {
    inject,
    bindable
} from 'aurelia-framework';
import {
    EventAggregator
} from 'aurelia-event-aggregator';

@inject(EventAggregator)
export class MazeCustomElement {

    constructor(eventAggregator) {
        this.ea = eventAggregator;
        this.ea.subscribe('checkWall', response => {
            if (!this.hasWall(response)) {
                this.ea.publish('movePlayer', response);
            }
        });
        this.ea.subscribe('restart', response => {
            this.makeNewMaze();
        });
        this.cells = [];
        this.metaCells = [];
        this.deadEnds = [];
        this.longestDeadEnds = [];
        this.width = 20;
        this.height = 20;
        this.directions = [[0, -1], [+1, 0], [0, +1], [-1, 0]];
        this.opposite = [2, 3, 0, 1];
    }

    isDeadEnd(cell) {
        return (cell.filter((wall) => {
            return wall === 1;
        }).length === 3) ? 'deadEnd' : '';
    }

    isFork(cell) {
        return (cell.filter((wall) => {
            return wall === 0;
        }).length === 3) ? 'fork' : '';
    }

    cellType(cell) {
        return this.isDeadEnd(cell) || this.isFork(cell) || '';
    }

    copyTypedCells() {
        const size = this.cells.length;
        let id = 0;
        let copy = this.cells.map((row, y) => {
            let rowCells = row.map((cell, x) => {
                let metaCell = {
                    walls: cell.slice(),
                    x: x,
                    y: y,
                    startX: x,
                    startY: y,
                    id: id,
                    type: this.cellType(cell)
                };
                id += 1;
                return metaCell;
            });
            return rowCells;
        });
        return copy;
    }

    copyMetaMaze() {
        return this.copyTypedCells();
    }

    flatten(arr) {
        return Array.prototype.concat(...arr);
    }

    extendDeadEnds() {

        // find dead ends
        let deadEnds2dim = this.metaCells.map((row) => {
            let deadRowCells = row.filter((cell) => {
                return cell.type === 'deadEnd';
            });
            return deadRowCells;
        });

        // make array 1 dimensional
        let deadEnds = this.flatten(deadEnds2dim);

        // mark dummy 'previous' cells of deadEnds so it can act as a normal cell with 2 openings in the loop below
        deadEnds = deadEnds.map((deadEnd) => {
            deadEnd.prev = this.opposite[deadEnd.walls.indexOf(0)];
            return deadEnd;
        });

        // find adjacent cells until it forks
        this.deadEnds = deadEnds.slice();
        let finished = false;
        let count = deadEnds.length;
        while (count > 3 && !finished) {
            let finished = true;
            deadEnds.forEach((deadEnd, index, deadEnds) => {

                // close entrance to determine open wall
                deadEnd.walls[deadEnd.prev] = 1;

                // determine adjacent connected cell
                let openWall = deadEnd.walls.indexOf(0);
                let neighbourXY = [deadEnd.x, deadEnd.y].map((xy, i) => {
                    return xy += this.directions[openWall][i];
                });
                let neighbour = this.metaCells[neighbourXY[1]][neighbourXY[0]];

                // remove deadEnd if fork is reached
                if (neighbour.type === 'fork') {
                    deadEnds.splice(index, 1);
                } else {
                    this.metaCells[neighbourXY[1]][neighbourXY[0]].id = deadEnd.id;
                    neighbour.startX = deadEnd.startX;
                    neighbour.startY = deadEnd.startY;
                    neighbour.id = deadEnd.id;
                    neighbour.type = 'path_' + neighbour.id; // id relating to deadEnd
                    neighbour.prev = this.opposite[openWall];
                    deadEnds[index] = neighbour;
                    finished = false;
                }
            });
            count = deadEnds.length;
        }
        return deadEnds.slice();
    }

    openLongestDeadends() {
        let deadEnds = this.longestDeadEnds.slice();
        deadEnds.forEach((deadEnd) => {
            let opened = false;
            deadEnd.walls.forEach((wall, i, walls) => {
                let neighborX = deadEnd.startX + this.directions[i][0];
                let neighborY = deadEnd.startY + this.directions[i][1];
                // check if neighbor is in the maze
                if (neighborX >= 0 &&
                    neighborX < this.width &&
                    neighborY >= 0 &&
                    neighborY < this.height) {
                    let neighbor = this.metaCells[neighborY][neighborX];
                    // check if neighbor is not on current path / deadEnd
                    if (!opened && deadEnd.id !== neighbor.id) {
                        // open these walls
                        opened = true;
                        this.cells[deadEnd.startY][deadEnd.startX][i] = 0;
                        this.cells[neighborY][neighborX][this.opposite[i]] = 0;
                    }
                }
            });
        });
    }

    hasWall(response) {
        let wallPositions = {
            'left': 3,
            'right': 1,
            'up': 0,
            'down': 2
        };
        if (wallPositions.hasOwnProperty(response.direction)) {
            return this.cells[response.player.y][response.player.x][wallPositions[response.direction]] == 1;
        }
    }

    cellClasses(cell, x, y) {
        let classList = [];
        classList.push('wall' + cell.join(''));
        if (this.metaCells.length) {
            classList.push(this.metaCells[y][x].type);
        }
        return classList.join(' ');
    }

    cellId(x, y) {
        return this.metaCells[y][x].id;
    }

    makeNewMaze() {
        this.cells = this.newMaze(this.width, this.height);
        this.metaCells = this.copyMetaMaze();
        this.longestDeadEnds = this.extendDeadEnds();
        this.openLongestDeadends();
    }

    newMaze(x, y) {
        // Thanks to https://github.com/dstromberg2/maze-generator

        // Establish variables and starting grid
        let totalCells = x * y;
        let cells = [];
        let unvis = [];
        for (let i = 0; i < y; i++) {
            cells[i] = [];
            unvis[i] = [];
            for (let j = 0; j < x; j++) {
                cells[i][j] = [1, 1, 1, 1];
                unvis[i][j] = true;
            }
        }

        // Set a random position to start from
        let currentCell = [Math.floor(Math.random() * y), Math.floor(Math.random() * x)];
        let path = [currentCell];
        unvis[currentCell[0]][currentCell[1]] = false;
        let visited = 1;

        // Loop through all available cell positions
        while (visited < totalCells) {
            // Determine neighboring cells
            let pot = [[currentCell[0] - 1, currentCell[1], 0, 2],
            [currentCell[0], currentCell[1] + 1, 1, 3],
            [currentCell[0] + 1, currentCell[1], 2, 0],
            [currentCell[0], currentCell[1] - 1, 3, 1]];
            let neighbors = [];

            // Determine if each neighboring cell is in game grid, and whether it has already been checked
            for (let l = 0; l < 4; l++) {
                if (pot[l][0] > -1 && pot[l][0] < y && pot[l][1] > -1 && pot[l][1] < x && unvis[pot[l][0]][pot[l][1]]) { neighbors.push(pot[l]); }
            }

            // If at least one active neighboring cell has been found
            if (neighbors.length) {
                // Choose one of the neighbors at random
                let next = neighbors[Math.floor(Math.random() * neighbors.length)];

                // Remove the wall between the current cell and the chosen neighboring cell
                cells[currentCell[0]][currentCell[1]][next[2]] = 0;
                cells[next[0]][next[1]][next[3]] = 0;

                // Mark the neighbor as visited, and set it as the current cell
                unvis[next[0]][next[1]] = false;
                visited++;
                currentCell = [next[0], next[1]];
                path.push(currentCell);
            }
            // Otherwise go back up a step and keep going
            else {
                currentCell = path.pop();
            }
        }
        return cells;
    }

    attached() {
        this.makeNewMaze();
    }


}
