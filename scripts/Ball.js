import * as THREE from "three";

const geometry = new THREE.SphereGeometry(30, 30, 30);
const material = new THREE.MeshLambertMaterial({color: 0xff0000});

export class Ball {
    constructor(positionX) {
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(positionX, 800, 0);
    }
    moveY(dt) {
        this.mesh.position.y -= 300 * dt;
    }
    getPosY() {
        return this.mesh.position.y;
    }
}