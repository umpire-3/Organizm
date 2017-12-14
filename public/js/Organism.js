class Organism {
    constructor({radius, position, color}) {
        if (!radius || !position) {
            throw Error('Organism: Radius or position are not specified');
        }

        let geometry = new THREE.SphereGeometry(radius, 32, 32),
            material = new THREE.MeshPhongMaterial({color: color});

        this.Mesh = new THREE.Mesh(geometry, material);
        this.Mesh.castShadow = true;
        this.Mesh.position.copy(position);
    }

    get THREE_Object() {
        return this.Mesh;
    }

    get position() {
        return this.Mesh.position;
    }

    get radius() {
        return this.Mesh.geometry.parameters.radius;
    }

    get color() {
        return this.Mesh.material.color;
    }
}