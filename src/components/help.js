import {
	inject,
	bindable
} from 'aurelia-framework';
import {
	EventAggregator
} from 'aurelia-event-aggregator';

@inject(EventAggregator)
export class HelpCustomElement {

	constructor(eventAggregator) {
		this._eventAggregator = eventAggregator;
		this.showHelp = true;
	}

	addEventListeners() {
		this._eventAggregator.subscribe('showHelp', response => {
			this.showHelp = true;
		});
		this._eventAggregator.subscribe('start', response => {
			this.showHelp = false;
		});
	}

	startGame(event) {
		event.stopPropagation(); // prevent players moving
		this._eventAggregator.publish('start');
	}

	startGameTouch(event) {
		this._eventAggregator.publish('isTouch');
		this.startGame(event);
	}

	attached() {
		this.addEventListeners();
	}

}
