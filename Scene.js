var THREE = require('./public/js/three.min');
var Body = require('./Body').Body;

class Scene {
    constructor() {
        this.bodies = [];
        this.gravity = new THREE.Vector3(0, -98, 0);
        this.edge = 0.1;
        this.cellSize = 200.0;
        for (var i = 0; i < 50; i++) {
            var r = Math.random() * (30);
            var m = r * r * r * Math.PI * (4.0 / 3.0);
            var p = new THREE.Vector3(Math.random() * (350 - 200) + 200,
                Math.random() * (350 - 200) + 200, Math.random() * (350 - 200) + 200);
            var v = new THREE.Vector3(Math.random() * (100 - 50) + 50,
                Math.random() * (100 - 50) + 50, Math.random() * (100 - 50) + 50);
            v.setLength(Math.random() * (200) / 4.0);
            a = new THREE.Vector3();
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
        for (var body of this.bodies) {
            body.setAcceleration(gravity);
        }
    }
    
    wallsCollision(body) {
    	if (body.position.x < -cellSize - edge + body.radius) {
    		body.position.x = -cellSize + body.radius;
    		body.velocity.x = -body.velocity.x;
    		body.velocity.setLength(body.velocity.length() * 3.0 / 4.0);
    	}
    	if (body.position.x > cellSize + edge - body.radius) {
    		body.position.x = cellSize - body.radius;
    		body.velocity.x = -body.velocity.x;
    		body.velocity.setLength(body.velocity.length() * 3.0 / 4.0);
    	}
    	if (body.position.y < -cellSize - edge + body.radius) {
    		body.position.y = -cellSize + body.radius;
    		body.velocity.y = -body.velocity.y;
    		body.velocity.setLength(body.velocity.length() * 3.0 / 4.0);
    	}
    	if (body.position.y > cellSize + edge - body.radius) {
    		body.position.y = cellSize - body.radius;
    		body.velocity.y = -body.velocity.y;
    		body.velocity.setLength(body.velocity.length() * 3.0 / 4.0);
    	}
    	if (body.position.z < -cellSize - edge + body.radius) {
    		body.position.z = -cellSize + body.radius;
    		body.velocity.z = -body.velocity.z;
    		body.velocity.setLength(body.velocity.length() * 3.0 / 4.0);
    	}
    	if (body.position.z > cellSize + edge - body.radius) {
    		body.position.z = cellSize - body.radius;
    		body.velocity.z = -body.velocity.z;
    		body.velocity.setLength(body.velocity.length() * 3.0 / 4.0);
    	}
    }

    solveCollision(body1, body2) {
    	var axis = new THREE.Vector3().subVectors(body2.position, body1.position);
    	var dist = body1.radius + body2.radius + edge;
    	if (axis.length() < dist) {
    		var p = axis.clone();
    		p.setLength(dist - axis.length());
    		body1.position.sub(p.multiplyScalar(body1.velocity.length() / 
    			(body1.velocity.length() + body2.velocity.length())));
    		body2.position.add(p.multiplyScalar(body2.velocity.length() / 
    			(body1.velocity.length() + body2.velocity.length())));

    		axis.normalize();

    		var u1 = axis.multiplyScalar(axis.dot(body1.velocity));
    		axis.negate();
    		var u2 = axis.multiplyScalar(axis.dot(body2.velocity));

    		var v1 = u1.multiplyScalar(body1.mass).add(u2.multiplyScalar(body2.mass)).sub(u1.sub(u2).multiplyScalar(body2.mass)).multiplyScalar(1.0 / (body1.mass + body2.mass));
    		var v2 = u1.multiplyScalar(body1.mass).add(u2.multiplyScalar(body2.mass)).sub(u2.sub(u1).multiplyScalar(body1.mass)).multiplyScalar(1.0 / (body1.mass + body2.mass));
    		body1.velocity = body1.velocity.sub(u1).add(v1);
    		body2.velocity = body2.velocity.sub(u2).add(v2);
    		body1.velocity.setLength(body1.velocity.length() * 3.0 / 4.0);
    		body2.velocity.setLength(body2.velocity.length() * 3.0 / 4.0);
    		return true;
    	}
    	return false;
    }

    Update(dt) {
    	for (var body of this.bodies) {
    		wallsCollision(body);
    		body.move(dt);
    	}
    	for (var i = 0; i < this.bodies.length; i++) {
    		for (var j = 0; j < this.bodies.length; j++) {
    			solveCollision(bodies[i], bodies[j]);
    		}
    	}
    }
}

module.exports.Scene = Scene;
