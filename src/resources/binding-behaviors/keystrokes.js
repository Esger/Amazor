export class Keystrokes {
    constructor() {
        this.myKeypressCallback = this.keypressInput.bind(this);
    }

    activate() {
        window.addEventListener('keypress', this.myKeypressCallback, false);
    }

    deactivate() {
        window.removeEventListener('keypress', this.myKeypressCallback);
    }

    // This function is called by the aliased method
    keypressInput(e) {
        console.log(e);
    }
}
