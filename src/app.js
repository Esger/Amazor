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
        this.keys = {
            'left': 37,
            'up': 38,
            'right': 39,
            'down': 40
        };
        this.touchEvent = {
            'startX': null,
            'startY': null,
            'endX': null,
            'endY': null,
        };
    }

    handleKeyInput = (event) => {
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
            default:
                this.ea.publish('keyPressed', "somekey");
        }
    }

    handleSwipe() {
        let thresHold = 50;
        let startX = this.touchEvent.startX;
        let startY = this.touchEvent.startY;
        let dX = this.touchEvent.endX - this.touchEvent.startX;
        let dY = this.touchEvent.endY - this.touchEvent.startY;
        let vertical = (Math.abs(dX) < Math.abs(dY));
        let horizontal = (Math.abs(dX) > Math.abs(dY));
        let left = (dX < -thresHold && Math.abs(dY) < thresHold);
        let right = (dX > thresHold && Math.abs(dY) < thresHold);
        let up = (dY < -thresHold && Math.abs(dX) < thresHold);
        let down = (dY > thresHold && Math.abs(dX) < thresHold);
        if (vertical) {
            if (up) {
                this.ea.publish('keyPressed', "up");
            }
            if (down) {
                this.ea.publish('keyPressed', "down");
            }
        }
        if (horizontal) {
            if (left) {
                this.ea.publish('keyPressed', "left");
            }
            if (right) {
                this.ea.publish('keyPressed', "right");
            }
        }
    }

    activate() {
        let self = this;
        let $body = $('body');

        document.addEventListener('keydown', self.handleKeyInput, true);
        $body.on('touchstart', function (event) {
            self.touchEvent.startX = event.originalEvent.touches[0].clientX;
            self.touchEvent.startY = event.originalEvent.touches[0].clientY;
        });
        $body.on('touchend', function (event) {
            self.touchEvent.endX = event.originalEvent.changedTouches[0].clientX;
            self.touchEvent.endY = event.originalEvent.changedTouches[0].clientY;
            self.handleSwipe();
        });

    }

}
