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
        this.acceptMoves = true;
        this.keys = {
            'enter': 13,
            'space': 32,
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
        document.addEventListener('keydown', () => { self.handleKeyInput(event); }, true);
        self.ea.subscribe('stop', response => {
            self.keysOff();
        });
        self.ea.subscribe('start', response => {
            self.keysOn();
        });
    }

    handleKeyInput(event) {
        let self = this;
        if (self.acceptMoves) {
            var keycode = event.keyCode || event.which; // also for cross-browser compatible
            switch (keycode) {
                case self.keys.left:
                    self.ea.publish('keyPressed', "left");
                    break;
                case self.keys.up:
                    self.ea.publish('keyPressed', "up");
                    break;
                case self.keys.right:
                    self.ea.publish('keyPressed', "right");
                    break;
                case self.keys.down:
                    self.ea.publish('keyPressed', "down");
                    break;
                case self.keys.enter:
                    self.ea.publish('keyPressed', "start");
                    break;
                case self.keys.space:
                    self.ea.publish('keyPressed', "start");
                    break;
                default:
                    self.ea.publish('keyPressed', "somekey");
            }
        }
        return true;
    }

    attached() {
        this.addListeners();
    }

}
