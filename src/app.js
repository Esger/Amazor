import {
    inject,
    bindable
} from 'aurelia-framework';
import {
    EventAggregator
} from 'aurelia-event-aggregator';
import $ from 'jquery';
import { KeyInputService } from 'services/key-input-service';
import { DeviceSensorService } from 'services/device-sensor-service';

@inject(EventAggregator, KeyInputService, DeviceSensorService)

export class App {

    constructor(eventAggregator, keyInputService, deviceSensorService) {
        this.ea = eventAggregator;
    }

}
