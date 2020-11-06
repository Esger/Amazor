import {
    inject,
    bindable
} from 'aurelia-framework';
import {
    EventAggregator
} from 'aurelia-event-aggregator';

@inject(EventAggregator)

export class KeyInputService {

    constructor(eventAggregator) {
        this.ea = eventAggregator;
        this.keys = {
            'enter': 13,
            'space': 32,
            'left': 37,
            'up': 38,
            'right': 39,
            'down': 40
        };
        document.addEventListener('keydown', (event) => { this.handleKeyInput(event); }, true);
    }

    handleKeyInput(event) {
        let self = this;
        let keycode = event.keyCode || event.which; // also for cross-browser compatible
        // if (self.acceptMoves) {
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
                self.ea.publish('start');
                break;
            case self.keys.space:
                self.ea.publish('start');
                break;
            default:
                self.ea.publish('keyPressed', "somekey");
        }
        // } else {
        // switch (keycode) {
        //     case self.keys.enter:
        //         self.ea.publish('reset');
        //         self.ea.publish('start');
        //         break;
        //     case self.keys.space:
        //         self.ea.publish('reset');
        //         self.ea.publish('start');
        //         break;
        //     default:
        //         void (0);
        // }
        // }
        return true;
    }

}