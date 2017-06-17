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
        this.cells = [];
        this.width = 20;
        this.height = 20;
        this.mazePosition = {
            x: -40,
            y: -40
        };
        this.ea = eventAggregator;
        this.ea.subscribe('keyPressed', response => {
            this.move(response);
        });
    }

    move(direction) {
        switch (direction) {
            case 'left':
                this.moveMaze(-1, 0);
                break;
            case 'right':
                this.moveMaze(1, 0);
                break;
            case 'up':
                this.moveMaze(0, -1);
                break;
            case 'down':
                this.moveMaze(0, 1);
                break;
            default:
        }
    }

    moveMaze(x, y) {
        let self = this;
        this.mazePosition.x += 4 * x;
        this.mazePosition.y += 4 * y;
        console.log(self.mazePosition.x, self.mazePosition.y);
    }

    wallClass(cell) {
        return 'wall' + cell.join('');
    }

    newMaze(x, y) {
        // Thanks to https://github.com/dstromberg2/maze-generator

        // Establish variables and starting grid
        let totalCells = x * y;
        let cells = new Array();
        let unvis = new Array();
        for (let i = 0; i < y; i++) {
            cells[i] = new Array();
            unvis[i] = new Array();
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
            let neighbors = new Array();

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
        this.cells = this.newMaze(this.width, this.height);
    }


}
