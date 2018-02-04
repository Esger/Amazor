import {
    inject,
    bindable
} from 'aurelia-framework';
import {
    EventAggregator
} from 'aurelia-event-aggregator';
import $ from 'jquery';

@inject(EventAggregator)

export class App {

    constructor(eventAggregator) {
        this.ea = eventAggregator;
        this.acceptMoves = false;
        this.keys = {
            'left': 37,
            'up': 38,
            'right': 39,
            'down': 40
        };
    }

    keysOff() {
        this.acceptMoves = false;
    }

    keysOn() {
        this.acceptMoves = true;
    }

    addListeners() {
        let self = this;
        document.addEventListener('keydown', self.handleKeyInput, true);
        self.ea.subscribe('stop', response => {
            self.keysOff();
        });
        self.ea.subscribe('start', response => {
            self.keysOn();
        });
    }

    handleKeyInput = (event) => {
        if (this.acceptMoves) {
            var keycode = event.keyCode || event.which; // also for cross-browser compatible
            switch (keycode) {
                case this.keys.left:
                    this.ea.publish('keyPressed', "left");
                    break;
                case this.keys.up:
                    this.ea.publish('keyPressed', "up");
                    break;
                case this.keys.right:
                    this.ea.publish('keyPressed', "right");
                    break;
                case this.keys.down:
                    this.ea.publish('keyPressed', "down");
                    break;
                case this.keys.enter:
                    this.ea.publish('keyPressed', "start");
                    break;
                default:
                    this.ea.publish('keyPressed', "somekey");
            }
        }
    }

    attached() {
        this.addListeners();
    }

}
