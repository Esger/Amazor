import {
    inject,
    bindable
} from 'aurelia-framework';
import {
    EventAggregator
} from 'aurelia-event-aggregator';

@inject(EventAggregator)

export class DeviceSensorService {

    constructor(eventAggregator) {
        this.ea = eventAggregator;
        this.tiltLR = 0;
        this.tiltFB = 0;
        this.addListeners();
    }

    pollOrientation() {
        let self = this;
        const TRESHOLD = 7.5;
        // check dominant orientation
        if (Math.abs(self.tiltLR) > Math.abs(self.tiltFB)) {
            // LR is dominant
            if (self.tiltLR < -TRESHOLD) {
                self.ea.publish('keyPressed', "left");
            }
            if (self.tiltLR > TRESHOLD) {
                self.ea.publish('keyPressed', "right");
            }
        } else {
            // FB is dominant
            if (self.tiltFB < -TRESHOLD) {
                self.ea.publish('keyPressed', "up");
            }
            if (self.tiltFB > TRESHOLD) {
                self.ea.publish('keyPressed', "down");
            }

        }
    }

    deviceOrientationHandler(event) {
        // event.preventDefault();
        // Get the left-to-right tilt (in degrees).
        this.tiltLR = event.gamma;

        // Get the front-to-back tilt (in degrees).
        this.tiltFB = event.beta;

    }

    addListeners() {
        // Check to make sure the browser supprots DeviceOrientationEvents
        if (window.DeviceOrientationEvent) {
            // Create an event listener
            window.addEventListener('deviceorientation', event => { this.deviceOrientationHandler(event); });
            setInterval(() => { this.pollOrientation(); }, 500);
        }

    }

}
