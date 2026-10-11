import * as THREE from "three";
import {OrbitControls} from "three/addons/controls/OrbitControls.js";

export class World {
    constructor(canvas) {
        this.renderer = new THREE.WebGLRenderer({canvas, antialias: true});
        this.renderer.setSize(canvas.width, canvas.height, false);

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x14101f);

        this.camera = new THREE.PerspectiveCamera(50, canvas.width / canvas.height, 1, 5000);

        this.controls = new OrbitControls(this.camera, canvas);
        this.controls.minDistance = 60;                     // ближе в персонажа не влетишь
        this.controls.maxDistance = 2500;                   // и слишком далеко не уйдёшь
        this.controls.maxPolarAngle = Math.PI / 2 - 0.02;   // камеру нельзя увести под землю

        // Обычное положение камеры: перед персонажем (уточняется через setHome)
        this.homePos = new THREE.Vector3(220, 80, 0);
        this.homeTarget = new THREE.Vector3(0, 45, 0);
        this.resetCamera();
    }

    add(object) {
        this.scene.add(object);
    }

    setHome(position, target) {
        this.homePos.copy(position);
        this.homeTarget.copy(target);
        this.resetCamera();
    }

    resetCamera() {
        this.camera.fov = 50;
        this.camera.updateProjectionMatrix();
        this.camera.position.copy(this.homePos);
        this.controls.target.copy(this.homeTarget);
        this.controls.update();
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }
}