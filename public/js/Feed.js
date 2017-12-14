class Feed extends Organism {
    constructor(position) {
        super({
            radius: parseInt(Math.random()*2) + 1,
            position,
            color: parseInt(Math.random()*16777215)
        });
    }
}