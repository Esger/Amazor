import {
    inject,
    bindable
} from 'aurelia-framework';
import {
    EventAggregator
} from 'aurelia-event-aggregator';
import $ from 'jquery';
import { KeyInputService } from 'services/key-input-service';

@inject(EventAggregator, KeyInputService)

export class App {

    constructor(eventAggregator, keyInputService) {
        this.ea = eventAggregator;
    }

}
