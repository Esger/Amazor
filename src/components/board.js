import { inject, bindable } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';
import { KeyInputService } from 'services/key-input-service';
import { DeviceSensorService } from 'services/device-sensor-service';
import { SwipeService } from 'services/swipe-service';

@inject(EventAggregator, KeyInputService, DeviceSensorService, SwipeService)
export class BoardCustomElement {

	constructor(eventAggregator, keyInputService, deviceSensorService, swipeService) {
		this.eventAggregator = eventAggregator;
		this._swipeService = swipeService;
		this._swipeService.setContainer('board');
		this.gamePosition = {};
		this.resetBoard();
		this.eventAggregator.subscribe('panZoom', response => {
			this.panZoomMaze(response);
		});
		this.eventAggregator.subscribe('reset', () => {
			this.resetBoard();
		});
	}

	panZoomMaze(response) {
		let self = this;
		let boardSize = 80;
		let scale = (response.scale > 1) ? 1 : response.scale;
		let mazeSize = 128 * scale;
		let minGamePosition = 0;
		let maxGamePosition = boardSize - mazeSize;

		let boardCenter = 6.25 * 6.4;
		let moveX = boardCenter - response.panBox.centerX * scale * 6.4;
		let moveY = boardCenter - response.panBox.centerY * scale * 6.4;
		let setValues = function () {
			self.gamePosition.x = Math.max(Math.min(moveX, minGamePosition), maxGamePosition);
			self.gamePosition.y = Math.max(Math.min(moveY, minGamePosition), maxGamePosition);
			self.scale = scale;
		};
		let wait = setTimeout(setValues, 0);
	}

	resetBoard() {
		this.gamePosition = {
			x: -3,
			y: -3
		};
		this.scale = 1;
		this.eventAggregator.publish('tiltControl', true);
	}

	attached() {
		this.resetBoard();
	}

}
