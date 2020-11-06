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
    this.tiltControlEnabled = false;
    this.tiltLR = 0;
    this.tiltFB = 0;
    this.addListeners();
  }

  pollOrientation() {
    let self = this;
    const TRESHOLD = 7.5;
    // check dominant orientation
    if (this.tiltControlEnabled) {
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
  }

  deviceOrientationHandler(event) {
    let self = this;
    // event.preventDefault();
    // Get the left-to-right tilt (in degrees).
    self.tiltLR = event.gamma;

    // Get the front-to-back tilt (in degrees).
    self.tiltFB = event.beta;
  }

  getHasTiltControl() {
    return this.hasTiltControl;
  }

  addListeners() {
    this.ea.subscribe('tiltControl', response => {
      this.tiltControlEnabled = response;
    });
    // Check to make sure the browser supprots DeviceOrientationEvents
    if (window.DeviceOrientationEvent && 'ontouchstart' in window) {
      this.hasTiltControl = true;
      // Create an event listener
      window.addEventListener('deviceorientation', event => { this.deviceOrientationHandler(event); });
      setInterval(() => { this.pollOrientation(); }, 500);
    }
  }

}
