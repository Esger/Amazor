import {
	inject
} from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';
import { event } from 'jquery';

@inject(EventAggregator)
export class SwipeService {

	constructor(eventAggregator) {
		this.ea = eventAggregator;
		this.swipeThreshold = 5;
		$('body').on('touchstart', event => {
			this.saveTouchstart(this.unify(event));
		}).on('touchend', event => {
			const direction = this.getSwipeDirection(this.unify(event));
			if (direction) {
				this.ea.publish('swipe', direction);
			}
		}).on('touchmove', event => {
			event.preventDefault();
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

	getSwipeDirection(event) {
		const dx = event.clientX - this.touchStartPosition.x;
		const dy = event.clientY - this.touchStartPosition.y;
		const absDx = Math.abs(dx);
		const absDy = Math.abs(dy);
		const distances = [dx, dy];
		if (Math.max(absDx, absDy) > this.swipeThreshold) {
			const largestDistance = absDx > absDy ? 0 : 1;
			const direction = (Math.sign(distances[largestDistance]) * 1 + 1) / 2; // 0 or 1
			const directions = [['left', 'right'], ['up', 'down']];
			return directions[largestDistance][direction];
		}
		return false;
	}

}
