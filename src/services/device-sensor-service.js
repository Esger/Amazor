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

    handleSensorInput(event) {
        let self = this;
        return true;
    }

    showTilting() {
        console.log('lr: ', this.tiltLR, ' fb: ', this.tiltFB);
    }

    deviceOrientationHandler(event) {
        event.preventDefault();
        // Get the left-to-right tilt (in degrees).
        this.tiltLR = event.gamma;

        // Get the front-to-back tilt (in degrees).
        this.tiltFB = event.beta;

    }

    addListeners() {
        let self = this;
        // Check to make sure the browser supprots DeviceOrientationEvents
        if (window.DeviceOrientationEvent) {
            // Create an event listener
            window.addEventListener('deviceorientation', this.deviceOrientationHandler);
            setInterval(self.showTilting, 1000);
        }
    }

}
