import * as THREE from "three";

const LIGHT_SPEED = 200;
const LIGHT_LIMIT = 800;
const SUN_BASE = 2.5;
const AMBIENT_BASE = 0.5;

export class Lights {
    constructor() {
        this.ambient = new THREE.AmbientLight(0xffffff, AMBIENT_BASE);
        this.sun = new THREE.DirectionalLight(0xffffff, SUN_BASE);
        this.sun.position.set(200, 300, 400);

        this.marker = new THREE.Mesh(
            new THREE.SphereGeometry(25, 16, 16),
            new THREE.MeshBasicMaterial({color: 0xffe600})
        );
        this.marker.position.copy(this.sun.position);

        this.group = new THREE.Group();
        this.group.add(this.ambient, this.sun, this.marker);

        this.activeMove = null;
    }

    bindButtons() {
        const bind = (id, axis, dir) => {
            document.getElementById(id).addEventListener("pointerdown", (e) => {
                e.preventDefault();
                this.activeMove = {axis, dir};
            });
        };

        bind("lightXMinus", "x", -1);
        bind("lightXPlus",  "x",  1);
        bind("lightYMinus", "y", -1);
        bind("lightYPlus",  "y",  1);
        bind("lightZMinus", "z", -1);
        bind("lightZPlus",  "z",  1);

        const stop = () => { this.activeMove = null; };
        window.addEventListener("pointerup", stop);
        window.addEventListener("pointercancel", stop);
        window.addEventListener("blur", stop);
    }

    setFlash(f) {
        this.sun.intensity = SUN_BASE + f * 8;
        this.ambient.intensity = AMBIENT_BASE + f * 1.5;
    }

    update(dt) {
        if (!this.activeMove) return;
        const {axis, dir} = this.activeMove;
        const value = this.sun.position[axis] + dir * LIGHT_SPEED * dt;
        this.sun.position[axis] = THREE.MathUtils.clamp(value, -LIGHT_LIMIT, LIGHT_LIMIT);
        this.marker.position.copy(this.sun.position);
    }
}