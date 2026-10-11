import * as THREE from "three";

const SPEED = 320;
const LOOKAHEAD = 0.01;
const DRIFT_GAIN = 8;
const MAX_DRIFT = 0.9;
const DRIFT_SMOOTH = 6;

const angleOf = (v) => Math.atan2(v.x, v.z);
const wrapAngle = (a) => Math.atan2(Math.sin(a), Math.cos(a));

export class AnimationController {
    constructor(world, button, track, hero) {
        this.world = world;
        this.button = button;
        this.track = track;
        this.hero = hero;

        this.isRunning = false;
        this.distance = 0;
        this.drift = 0;

        this.pos = new THREE.Vector3();
        this.tan = new THREE.Vector3();
        this.tanAhead = new THREE.Vector3();

        button.addEventListener("click", () => this.start());
    }

    get duration() {
        return this.track.length / SPEED;
    }

    resetHero() {
        this.distance = 0;
        this.drift = 0;
        this.placeHero(0);
    }

    placeHero(dt) {
        const u = this.distance / this.track.length;
        this.track.pointAt(u, this.pos);
        this.track.tangentAt(u, this.tan);
        this.track.tangentAt(u + LOOKAHEAD, this.tanAhead);

        const turn = wrapAngle(angleOf(this.tanAhead) - angleOf(this.tan));

        const target = THREE.MathUtils.clamp(turn * DRIFT_GAIN, -MAX_DRIFT, MAX_DRIFT);

        this.drift += (target - this.drift) * Math.min(1, dt * DRIFT_SMOOTH);

        this.hero.placeAt(this.pos, this.tan, this.drift);
    }

    start() {
        this.isRunning = true;
        this.resetHero();
        this.world.controls.enabled = false;
        this.button.disabled = true;
        this.button.textContent = "Идёт...";
    }

    stop() {
        this.isRunning = false;
        this.world.controls.enabled = true;
        this.button.disabled = false;
        this.button.textContent = "Анимация";
        this.world.resetCamera();
        this.resetHero();
    }

    update(dt) {
        this.distance += SPEED * dt;
        if (this.distance >= this.track.length) {
            this.stop();
            return;
        }
        this.placeHero(dt);
    }
}