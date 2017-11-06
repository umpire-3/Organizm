/**
 * Created by Umpire on 28.10.2017.
 */


class Ball{
    constructor(radius, position, color) {
        let geometry = new THREE.SphereGeometry(radius, 32, 32),
            material = new THREE.MeshPhongMaterial({color: color});

        this.Mesh = new THREE.Mesh(geometry, material);
        this.Mesh.castShadow = true;
        this.Mesh.position.set(position.x, position.y, position.z);
    }

    add(){
        scene.add(this.Mesh);
    }

    remove(){
        scene.remove(this.Mesh);
    }
}
