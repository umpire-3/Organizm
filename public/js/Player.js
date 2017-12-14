class Player extends Organism {
    constructor({controls, radius, position, color}) {
        super({
            radius,
            position,
            color
        });

        if (controls) {
            controls.target = this.Mesh.position;
            this.controls = controls;
        }
    }

    getCamDirection() {
        return new THREE.Vector3()
            .subVectors(
                this.controls.target,
                this.controls.object.position
            ).normalize();
    }

    update({position}) {
        if (this.controls) {
            this.controls.object.position.add(
                new THREE.Vector3().subVectors(
                    position,
                    this.Mesh.position
                )
            );
        }

        this.Mesh.position.copy(position);
    }

    get radius() {
        return super.radius;
    }

    set radius(r) {
        if (this.controls) {
            let direction = this.controls.object.position.clone().sub(this.controls.target),
                ratio = this.radius / r;
            this.controls.object.position.addScaledVector(direction, 1 - ratio);
        }

        this.Mesh.geometry = new THREE.SphereGeometry(r, 32, 32);
    }
}