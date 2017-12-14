class Keyboard {
    constructor() {
        this.keys = {
            up: new Map(),
            down: new Map(),
            press: new Map(),
        };

        document.addEventListener('keydown', e => {
            //console.log(e.keyCode);

            let key = this.keys.down.get(e.keyCode);
            if (key) {
                key.action(...key.args);
            }

            key = this.keys.press.get(e.keyCode);
            if (key) {
                key.pressed = true;
            }

            return false;
        });

        document.addEventListener('keyup', e => {
            let key = this.keys.up.get(e.keyCode);
            if (key) {
                key.action(...key.args);
            }

            key = this.keys.press.get(e.keyCode);
            if (key) {
                key.pressed = false;
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

    getPressedKeys() {
        let keys = [];
        for (let [keyCode, { pressed }] of this.keys.press) {
            if (pressed) {
                keys.push(keyCode);
            }
        }
        return keys;
    }

    on(event, key, action, ...args) {
        switch (event) {
            case 'up': case 'down':
                this.keys[event].set(key, { action, args });
                break;
            case 'press':
                this.keys.press.set(key, {
                    pressed: false,
                    action,
                    args
                });
                break;
            default:
                console.log('Invalid key event (use [\'up\', \'down\', \'press\']).');
        }
    }

    clean(event, key) {
        let keys = this.keys[event];
        if (keys) {
            keys.delete(key);
        }
    }
}
