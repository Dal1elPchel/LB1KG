import * as THREE from "three";

export class Lights {
    constructor() {
        this.ambient = new THREE.AmbientLight(0xffffff, 0.5);
        this.sun = new THREE.DirectionalLight(0xffffff, 2.5);
        this.sun.position.set(200, 300, 400);



        this.lights = new THREE.Group();
        this.lights.add(this.ambient, this.sun);
    }
}