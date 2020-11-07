import {
	inject,
	bindable
} from 'aurelia-framework';
import {
	EventAggregator
} from 'aurelia-event-aggregator';
import {
	DeviceSensorService
} from 'services/device-sensor-service';
@inject(EventAggregator, DeviceSensorService)
export class StatusCustomElement {

	constructor(eventAggregator, deviceSensorService) {
		this.ea = eventAggregator;
		this.level = 0;
		this.moves = 0;
		this.best = null;
		this.hasTiltControl = deviceSensorService.getHasTiltControl();
		this._tiltControlStatus = true;
	}

	get tiltControlStatus() {
		return this._tiltControlStatus;
	}

	attached() {
		this.statusSubscriber = this.ea.subscribe('statusUpdate', response => {
			this.level = response.level;
			this.moves = response.moves;
			this.best = response.best;
		});
		this.tiltControlSubscriber = this.ea.subscribe('tiltControl', response => {
			this._tiltControlStatus = response;
		});
	}

	detached() {
		this.statusSubscriber.dispose();
		this.tiltControlSubscriber.dispose();
	}

	resetHighScore() {
		this.ea.publish('resetHighScore', this.level);
	}

	toggleTiltControl() {
		this.ea.publish('tiltControl', !this._tiltControlStatus);
	}
}
