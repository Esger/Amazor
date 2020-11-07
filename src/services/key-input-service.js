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
		this._eventAgregator = eventAggregator;
		this._keys = {
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
		let keycode = event.keyCode || event.which; // for cross-browser compatibility
		switch (keycode) {
			case this._keys.left:
				this._eventAgregator.publish('keyPressed', "left");
				break;
			case this._keys.up:
				this._eventAgregator.publish('keyPressed', "up");
				break;
			case this._keys.right:
				this._eventAgregator.publish('keyPressed', "right");
				break;
			case this._keys.down:
				this._eventAgregator.publish('keyPressed', "down");
				break;
			case this._keys.enter:
				this._eventAgregator.publish('start');
				break;
			case this._keys.space:
				this._eventAgregator.publish('start');
				break;
			default:
				this._eventAgregator.publish('keyPressed', "somekey");
		}
		return true;
	}

}
