class Player {
    constructor({controls, radius, position, color}) {
        if (!radius || !position) {
            throw Error('Player: Radius or position are not specified');
        }

        let geometry = new THREE.SphereGeometry(radius, 32, 32),
            material = new THREE.MeshPhongMaterial({color: color});

        this.Mesh = new THREE.Mesh(geometry, material);
        this.Mesh.castShadow = true;
        this.Mesh.position.set(position.x, position.y, position.z);

        if (controls) {
            controls.target = this.Mesh.position;
            this.controls = controls;
        }
    }

    get THREE_Object() {
        return this.Mesh;
    }

    getCamDirection() {
        return new THREE.Vector3()
            .subVectors(
                this.controls.target,
                this.controls.object.position
            ).normalize();
    }

    update({position}) {
        if(this.controls) {
            this.controls.object.position.add(
                new THREE.Vector3().subVectors(
                    position,
                    this.Mesh.position
                )
            );
        }

        this.Mesh.position.copy(position);
    }

    // setupControls(keyboard) {
    //     keyboard.on('press', Keys.VK_K, () => {
    //
    //     });
    // }

}