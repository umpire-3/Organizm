const THREE = require('three');

const gravity = new THREE.Vector3(0, -98, 0);

class Scene {
	static get feedAmount(){ return 200.0; }
	static get gravity(){ return gravity; }
	static get gameAreaSize() { return 200.0; }

    constructor() {
	    this.players = new Map();
	    this.playersArray = [];
	    this.feed = Array.from(function* () {
            for (let i = 0; i < Scene.feedAmount; ++i) {
                yield new THREE.Vector3(
                    Scene.gameAreaSize * (2 * Math.random() - 1),
                    Scene.gameAreaSize * (2 * Math.random() - 1),
                    Scene.gameAreaSize * (2 * Math.random() - 1)
                );
            }
        }());
	    this._feedEvent = new Function();
        this._deathEvent = new Function();
    }

    updateArray() {
	    this.playersArray = Array.from(this.players);
    }

    addPlayer(id, player) {
	    let res = this.players.set(id, player)
        this.updateArray();
        return res;
    }

    removePlayer(id) {
	    let res = this.players.delete(id);
        this.updateArray();
	    return res;
    }

    getPlayer(id) {
	    return this.players.get(id);
    }

    getPlayersData() {
	    return Array.from(
	        this.players,
            ([id, player]) => [id, player.getData()]
        );
    }

    getFeedData() {
	    return this.feed;
    }

    update(dt) {
	    for (let [i, [id, player]] of this.playersArray.entries()) {
            player.update(dt);

	        let toDel = [];
	        for (let [index, feedPiece] of this.feed.entries()) {
	            let distance = player.position.clone().sub(feedPiece);
	            if (distance.lengthSq() < Math.pow(player.radius, 2)) {
                    toDel.push(index);
                    this._feedEvent(id, index, player.feed());
                }
            }
            for (let index of toDel) {
	            this.feed.splice(index, 1);
            }
            for (let j = i + 1; j < this.playersArray.length; ++j) {
	            this.resolveConflict([id, player], this.playersArray[j]);
            }
        }
    }

    resolveConflict([i1, p1], [i2, p2]) {
	    let distance = p2.position.clone().sub(p1.position),
            dr = p1.radius - p2.radius;
	    if (dr != 0.0 && distance.lengthSq() < Math.pow(dr, 2)) {
	        let deadId = undefined;
            if (dr > 0) {
                deadId = i2;
            }
            else {
                deadId = i1;
            }
            this.removePlayer(deadId);
            this._deathEvent(deadId)
        }
    }

    onFeed(callback) {
	    this._feedEvent = callback;
    }

    onDeath(callback) {
        this._deathEvent = callback;
    }
}

module.exports = Scene;
