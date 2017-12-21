const THREE = require('three');
const Body = require('./Body');

class Player {
    constructor() {
        this.body = new Body({
            mass: 10,
            radius: 10,
            position: new THREE.Vector3(
                parseInt(Math.random() * 350) - 200,
                parseInt(Math.random() * 350) - 200,
                parseInt(Math.random() * 350) - 200
            )
        });

        this.color = parseInt(Math.random()*16777215);
    }

    move(force) {
        // this.body.position.addScaledVector(force, 1/this.body.mass);
        this.body.velocity = new THREE.Vector3().addScaledVector(force, 1/this.body.mass);
    }

    feed(x = 1) {
        this.body.radius += x;
        this.body.mass *= 1.0 + x/this.body.radius;
        return x;
    }

    update(dt) {
        this.body.update(dt);
    }

    getData() {
        return {
            radius: this.body.radius,
            position: this.body.position,
            color: this.color
        };
    }

    get position() {
        return this.body.position;
    }

    get radius() {
        return this.body.radius;
    }

    get mass() {
        return this.body.mass;
    }
}

module.exports = Player;
