const THREE = require('three');
const Body = require('./Body');

const gravity = new THREE.Vector3(0, -98, 0);

class Scene {
	static get cellSize(){ return 200.0; }
	static get edge(){ return 0.1; }
	static get gravity(){ return gravity; }

    constructor() {
	    this.players = new Map();
    }

    addPlayer(id, player) {
	    return this.players.set(id, player);
    }

    removePlayer(id) {
	    return this.players.delete(id);
    }

    getPlayer(id) {
	    return this.players.get(id);
    }

    getPlayersInfo() {
	    return Array.from(
	        this.players,
            ([id, player]) => [id, player.getInfo()]
        );
    }

    update(dt) {
	    for (let player of this.players.values()) {
	        player.update(dt);
        }
    }

    [Symbol.iterator]() {
        return this.players.values();
    }
}

module.exports = Scene;
