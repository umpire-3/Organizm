const THREE = require('three');

class Body {

	constructor ({
        mass = 0.0, 
        radius = 0.0, 
        position = new THREE.Vector3(), 
        velocity = new THREE.Vector3(), 
        acceleration = new THREE.Vector3()
    } = {}) {
        this.mass = mass;
        this.radius = radius;
        this.position = position;
        this.velocity = velocity;
        this.acceleration = acceleration;
    }

    move (dt) {
    	this.position.addScaledVector(this.velocity, dt);
        this.velocity.addScaledVector(this.acceleration, dt);
    }
}

module.exports = Body;
