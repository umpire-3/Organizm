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
        this.body.velocity.addScaledVector(force, 1/this.body.mass);
    }

    // feed(...) {
    //    TODO: implement this later
    // }

    update(dt) {
        this.body.move(dt);
    }

    getInfo() {
        return {
            radius: this.body.radius,
            position: this.body.position,
            color: this.color
        };
    }
}

module.exports = Player;
