var THREE = require('three');
var Body = require('./Body').Body;


const cellSize = 200.0,
    edge = 0.1,
    gravity = new THREE.Vector3(0, -98, 0);

class Scene {
    constructor() {
        this.bodies = [];
        for (let i = 0; i < 100; i++) {
            let r = parseInt(Math.random() * 29) + 1;
            let m = Math.pow(r,3) * Math.PI * (4.0 / 3.0);
            let p = new THREE.Vector3(
                parseInt(Math.random() * 350) - 200,
                parseInt(Math.random() * 350) - 200,
                parseInt(Math.random() * 350) - 200
            );
            let v = new THREE.Vector3(
                parseInt(Math.random() * 100) - 50,
                parseInt(Math.random() * 100) - 50,
                parseInt(Math.random() * 100) - 50
            );
            v.setLength(parseInt(Math.random() * 200) / 4.0);
            let a = new THREE.Vector3();
            this.bodies.push(new Body({
                mass: m,
                radius: r,
                position: p,
                velocity: v,
                acceleration: a
            }));
        }
    }

    setGravity(gravity) {
        for (let body of this.bodies) {
            body.acceleration.copy(gravity);
        }
    }
    
    wallsCollision(body) {
    	if (body.position.x < -cellSize - edge + body.radius) {
    		body.position.x = -cellSize + body.radius;
    		body.velocity.x = -body.velocity.x;
    		body.velocity.multiplyScalar(0.8);
    	}
    	if (body.position.x > cellSize + edge - body.radius) {
    		body.position.x = cellSize - body.radius;
    		body.velocity.x = -body.velocity.x;
    		body.velocity.multiplyScalar(0.8);
    	}
    	if (body.position.y < -cellSize - edge + body.radius) {
    		body.position.y = -cellSize + body.radius;
    		body.velocity.y = -body.velocity.y;
    		body.velocity.multiplyScalar(0.8);
    	}
    	if (body.position.y > cellSize + edge - body.radius) {
    		body.position.y = cellSize - body.radius;
    		body.velocity.y = -body.velocity.y;
    		body.velocity.multiplyScalar(0.8);
    	}
    	if (body.position.z < -cellSize - edge + body.radius) {
    		body.position.z = -cellSize + body.radius;
    		body.velocity.z = -body.velocity.z;
    		body.velocity.multiplyScalar(0.8);
    	}
    	if (body.position.z > cellSize + edge - body.radius) {
    		body.position.z = cellSize - body.radius;
    		body.velocity.z = -body.velocity.z;
    		body.velocity.multiplyScalar(0.8);
    	}
    }

    solveCollision(body1, body2) {
    	let axis = body2.position.clone().sub(body1.position);
    	let dist = body1.radius + body2.radius + edge;
    	if (axis.length() < dist) {
    		let p = axis.clone();
    		p.setLength(dist - axis.length());

            body1.position.addScaledVector(
                p,
                -body1.velocity.length() / (body1.velocity.length() + body2.velocity.length())
            );
            body2.position.addScaledVector(
                p,
                body1.velocity.length() / (body2.velocity.length() + body2.velocity.length())
            );

    		axis.normalize();

    		let u1 = axis.clone().multiplyScalar(axis.dot(body1.velocity));
    		axis.negate();
    		let u2 = axis.clone().multiplyScalar(axis.dot(body2.velocity));

            let v1 = u1.clone().sub(u2).multiplyScalar(body2.mass).negate()
                    .addScaledVector(u1, body1.mass).addScaledVector(u2, body2.mass)
                    .divideScalar(body1.mass + body2.mass),
                v2 = u2.clone().sub(u1).multiplyScalar(body1.mass).negate()
                    .addScaledVector(u1, body1.mass).addScaledVector(u2, body2.mass)
                    .divideScalar(body1.mass + body2.mass);

    		body1.velocity.sub(u1).add(v1);
    		body2.velocity.sub(u2).add(v2);
    		body1.velocity.multiplyScalar(0.8);
    		body2.velocity.multiplyScalar(0.8);
    		return true;
    	}
    	return false;
    }

    update(dt) {
    	for (let body of this.bodies) {
    		this.wallsCollision(body);
    		body.move(dt);
    	}
    	for (let i = 0; i < this.bodies.length - 1; i++) {
    		for (let j = i + 1; j < this.bodies.length; j++) {
    			this.solveCollision(
                    this.bodies[i],
                    this.bodies[j]
                );
    		}
    	}
    }
}

Scene.prototype.gravity = gravity;
Scene.prototype.edge = edge;
Scene.prototype.cellSize = cellSize;

module.exports.Scene = Scene;
