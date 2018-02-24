import {
    inject,
    bindable
} from 'aurelia-framework';
import {
    EventAggregator
} from 'aurelia-event-aggregator';

@inject(EventAggregator)

export class MazeWorkerService {

    constructor(eventAggregator) {
        this.ea = eventAggregator;
        this.mzWrkr = new Worker('./assets/workers/maze-worker.js');
        this.mzWrkr.onmessage = (e) => {
            this.ea.publish('directionToPlayer', e.data);
        };
    }

    initMazeWorker(cells) {
        let workerData = {
            message: 'initMaze',
            cells: cells
        };
        this.mzWrkr.postMessage(workerData);
    }

    getDirection(player, targetPositions) {
        this.mzWrkr.postMessage({
            message: 'getDirection',
            player: player,
            targetPositions: targetPositions
        });
    }

}
