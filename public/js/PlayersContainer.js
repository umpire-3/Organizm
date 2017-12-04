class PlayersContainer {
    constructor() {
        this.players = new Map();
        this.group = new THREE.Group();
    }

    add(id, player) {
        this.players.set(id, player);
        this.group.add(player.THREE_Object);
    }

    remove(id) {
        let player = this.players.get(id);
        this.group.remove(player.THREE_Object);

        return this.players.delete(id);
    }

    get(id) {
        return this.players.get(id);
    }

}