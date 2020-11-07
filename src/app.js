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
import { SwipeService } from 'services/swipe-service';

@inject(EventAggregator, KeyInputService, DeviceSensorService, SwipeService)
export class App {

	constructor(eventAggregator, keyInputService, deviceSensorService, swipeService) {
		this.ea = eventAggregator;
	}

}
