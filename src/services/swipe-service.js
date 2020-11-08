import {
	inject
} from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';
import { event } from 'jquery';

@inject(EventAggregator)
export class SwipeService {

	constructor(eventAggregator) {
		this._eventAggregator = eventAggregator;
		this._swipeThreshold = 5;
		this._preventDoubleAction = false;
	}

	addListener() {
		this._$container.off();
		this._$container.on('touchstart mousedown', event => {
			this.saveTouchstart(this.unify(event));
		}).on('touchend mouseup', event => {
			const direction = this.getDirection(this.unify(event));
			if (direction && !this._preventDoubleAction) {
				this._eventAggregator.publish('direction', direction);
				this._preventDoubleAction = true;
				setTimeout(() => {
					this._preventDoubleAction = false;
				}, 100);
			}
		});
	}

	attached() {
		this._$container = $('body');
	}

	setContainer(element) {
		setTimeout(() => {
			this._$container = $(element);
			this.addListener();
		});
	}

	unify(event) {
		return event.changedTouches ? event.changedTouches[0] : event;
	}

	saveTouchstart(event) {
		this.touchStartPosition = {
			x: event.clientX,
			y: event.clientY
		};
	}

	getDirection(event) {
		const dx = event.clientX - this.touchStartPosition.x;
		const dy = event.clientY - this.touchStartPosition.y;
		const absDx = Math.abs(dx);
		const absDy = Math.abs(dy);
		const distances = [dx, dy];
		if (Math.max(absDx, absDy) > this._swipeThreshold) { // swipe or gesture
			const largestDistance = absDx > absDy ? 0 : 1;
			const direction = (Math.sign(distances[largestDistance]) * 1 + 1) / 2; // 0 or 1
			const directions = [['left', 'right'], ['up', 'down']];
			return directions[largestDistance][direction];
		} else {
			const board = this._$container;
			const boardSize = board.height();
			let clickX, clickY;
			if (event.pageX) { // click
				clickX = event.pageX - this._$container.offset().left;
				clickY = event.pageY - this._$container.offset().top;
			} else { // tap
				const offset = board.offset();
				const touch = event.touches[0];
				clickX = touch.pageX - offset.left;
				clickY = touch.pageY - offset.top;
			}
			// Diagonals: y = x and y = h - x -> (hMinX)
			const directions = ['down', 'left', 'right', 'up'];
			const upRight = clickY < clickX;
			const upLeft = clickY < boardSize - clickX;
			const direction = directions[upLeft * 1 + upRight * 2];
			return direction;
		}
	}

}
