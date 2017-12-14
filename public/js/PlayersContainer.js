class PlayersContainer extends Map {
    constructor() {
        super();
        this.group = new THREE.Group();
    }

    set(id, player) {
        this.group.add(player.THREE_Object);
        return super.set(id, player);
    }

    delete(id) {
        let player = this.get(id);
        if (player) {
            this.group.remove(player.THREE_Object);
        }

        return super.delete(id);
    }
}