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
            console.log('keypressed', response);
            for (let i = 0; i < this.players.length; i++) {
                this.ea.publish('checkWall', { direction: response, player: this.players[i] });
            }
        });

        this.ea.subscribe('moveOpposite', response => {
            console.log('moving opposite', response);
            this.moveOpposite(response);
            console.log('new positions ', this.players[0], this.players[1]);
        });

        this.players = [
            {
                name: 'black',
                x: 5,
                y: 5
            },
            {
                name: 'white',
                x: 14,
                y: 14
            }
        ]
    }

    moveOpposite(response) {
        let self = this;
        let directions = {
            'left': [1, 0],
            'right': [-1, 0],
            'up': [0, 1],
            'down': [0, -1]
        };
        let move = function (xy) {
            if (response.player.name == 'black') {
                self.players[0].x += xy[0];
                self.players[0].y += xy[1];
            } else {
                self.players[1].x += xy[0];
                self.players[1].y += xy[1];
            }
        };
        move(directions[response.direction]);
    }

}
