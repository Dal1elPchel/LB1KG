import * as THREE from "three";
import {OrbitControls} from "three/addons/controls/OrbitControls.js";

const DEFAULT_CAM = {x: 0, y: 1400, z: 1300};

export class World {
    constructor(canvas) {
        this.renderer = new THREE.WebGLRenderer({canvas, antialias: true});
        this.renderer.setSize(canvas.width, canvas.height, false);

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x14101f);

        this.camera = new THREE.PerspectiveCamera(50, canvas.width / canvas.height, 1, 5000);
        this.controls = new OrbitControls(this.camera, canvas);

        this.resetCamera();
    }

    add(object) {
        this.scene.add(object);
    }

    resetCamera() {
        this.camera.fov = 50;
        this.camera.updateProjectionMatrix();
        this.camera.position.set(DEFAULT_CAM.x, DEFAULT_CAM.y, DEFAULT_CAM.z);
        this.controls.target.set(0, 0, 0);
        this.controls.update();
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }
}