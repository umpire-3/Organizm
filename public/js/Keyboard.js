class Keyboard {
    constructor() {
        this.keys = {
            up: Utils.makeIterable(),
            down: Utils.makeIterable(),
            press: Utils.makeIterable(),
        }

        document.addEventListener('keydown', e => {
            //console.log(e.keyCode);

            let key = this.keys.down[e.keyCode];
            if (key) {
                key.action(...key.args);
            }

            if(this.keys.press.hasOwnProperty(e.keyCode)){
                this.keys.press[e.keyCode].pressed = true;
            }
            return false;
        });

        document.addEventListener('keyup', e => {
            let key = this.keys.up[e.keyCode];
            if (key) {
                key.action(...key.args);
            }

            if(this.keys.press.hasOwnProperty(e.keyCode)){
                this.keys.press[e.keyCode].pressed = false;
            }
            return false;
        });

    }

    process() {
        for (let { 
            pressed, 
            action, 
            args 
        } of this.keys.press.values()) {
            if (pressed) {
                action(...args);
            }
        }
    }

    on(event, key, action, ...args) {
        switch (event) {
            case 'up': case 'down':
                this.keys[event][key] = { action, args };
                break;
            case 'press':
                this.keys.press[key] = {
                    pressed: false,
                    action,
                    args
                };
                break;
            default:
                console.log('Invalid key event (use [\'up\', \'down\', \'press\']).');
        }
    }

    clean(event, key) {
        let keys = this.keys[event];
        if (keys) {
            delete keys[key];
        }
    }
}