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
	    let res = this.players.set(id, player);
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
	            if (distance.lengthSq() < player.radius * player.radius) {
                    toDel.push(index);
                    this._feedEvent(id, player.feed(), index);
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

    resolveConflict(player_1, player_2) {
	    let distanceSq = player_2[1].position.distanceToSquared(player_1[1].position),
            deltaRadius = player_1[1].radius - player_2[1].radius;
	    if (deltaRadius !== 0.0 && distanceSq <= deltaRadius * deltaRadius) {

            if (deltaRadius > 0) {
                this._kill(player_2, player_1);
            }
            else {
                this._kill(player_1, player_2);
            }
        }
    }

    _kill([toKillId, toKillPlayer], [toFeedId, toFeedPlayer]) {
        this.removePlayer(toKillId);
        this._deathEvent(toKillId);

        this._feedEvent(toFeedId, toFeedPlayer.feed(toKillPlayer.radius));
    };

    onFeed(callback) {
	    this._feedEvent = callback;
    }

    onDeath(callback) {
        this._deathEvent = callback;
    }
}

module.exports = Scene;
