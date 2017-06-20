import {
    inject,
    bindable
} from 'aurelia-framework';
import {
    EventAggregator
} from 'aurelia-event-aggregator';

@inject(EventAggregator)
export class WinCustomElement {

    constructor(eventAggregator) {
        this.ea = eventAggregator;
        this.showWin = false;
        this.ea.subscribe('allTogether', response => {
            this.showWin = true;
            console.log(this.showWin);
        });
    }


    attached() {

    }


}
