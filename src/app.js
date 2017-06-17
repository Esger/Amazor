import {
    inject,
    bindable
} from 'aurelia-framework';
import {
    EventAggregator
} from 'aurelia-event-aggregator';

@inject(EventAggregator)

export class App {

    constructor(eventAggregator) {
        this.keys = {
            'left': 37,
            'up': 38,
            'right': 39,
            'down': 40
        };
    }

    handleKeyInput = (event) => {
        var keycode = event.keyCode || event.which; // also for cross-browser compatible
        if (this.listen2keys) {
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
                default:
                    this.ea.publish('keyPressed', "somekey");
            }
        }
    }

}
