import * as THREE from "three";

export class World {
    constructor(canvas) {
        this.renderer = new THREE.WebGLRenderer({canvas, antialias: true});
        this.renderer.setSize(canvas.width, canvas.height, false);

        this.scene = new THREE.Scene();
        const loader = new THREE.TextureLoader();
        const bg = loader.load("../textures/i.jpeg");
        bg.colorSpace = THREE.SRGBColorSpace;
        this.scene.background = bg;

        this.camera = new THREE.PerspectiveCamera(50, canvas.width / canvas.height, 1, 5000);
        this.camera.position.set(0, 300, 1000);
    }

    add(object) {
        this.scene.add(object);
    }

    remove(object) {
        this.scene.remove(object);
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }
}