import {
    inject,
    bindable
} from 'aurelia-framework';
import {
    EventAggregator
} from 'aurelia-event-aggregator';

@inject(EventAggregator)
export class HeaderCustomElement {

    constructor(eventAggregator) {
        this.ea = eventAggregator;
        this.level = 0;
        this.ea.subscribe('statusUpdate', response => {
            this.level = response.level;
        });
    }

}