import * as THREE from "three";
import {SHOTS} from "./shots.js";

const LOOKAHEAD = 0.01;     // на какую долю круга смотрим вперёд для заноса
const DRIFT_GAIN = 8;
const MAX_DRIFT = 0.9;
const DRIFT_SMOOTH = 6;
const RISE = 0.35;   // секунд, за которые вспышка плавно нарастает перед склейкой
const FALL = 0.20;

const angleOf = (v) => Math.atan2(v.x, v.z);
const wrapAngle = (a) => Math.atan2(Math.sin(a), Math.cos(a));

export class AnimationController {
    constructor(world, button, track, hero, lights) {
        this.world = world;
        this.button = button;
        this.track = track;
        this.hero = hero;
        this.lights = lights;

        this.totalDuration = SHOTS.reduce((sum, s) => sum + s.dur, 0);   // длина ролика
        this.speed = track.length / this.totalDuration;                  // за ролик ровно один круг

        this.isRunning = false;
        this.time = 0;           // время ролика
        this.distance = 0;       // пройденный путь
        this.drift = 0;
        this.shotIndex = 0;
        this.shotTime = 0;

        // Общий контекст, который получают ракурсы
        this.ctx = {
            track,
            trackLength: track.length,
            speed: this.speed,
            distance: 0,
            pos: new THREE.Vector3(),
            tan: new THREE.Vector3(),
            face: new THREE.Vector3(),
            anchor: new THREE.Vector3(),
            tmp: new THREE.Vector3(),
            camPos: new THREE.Vector3(),
            camLook: new THREE.Vector3(),
        };
        this.tanAhead = new THREE.Vector3();

        button.addEventListener("click", () => this.start());
    }

    resetHero() {
        this.distance = 0;
        this.drift = 0;
        this.placeHero(0);
    }

    placeHero(dt) {
        const c = this.ctx;
        const u = this.distance / this.track.length;
        this.track.pointAt(u, c.pos);
        this.track.tangentAt(u, c.tan);
        this.track.tangentAt(u + LOOKAHEAD, this.tanAhead);

        const turn = wrapAngle(angleOf(this.tanAhead) - angleOf(c.tan));
        const target = THREE.MathUtils.clamp(turn * DRIFT_GAIN, -MAX_DRIFT, MAX_DRIFT);
        this.drift += (target - this.drift) * Math.min(1, dt * DRIFT_SMOOTH);

        this.hero.placeAt(c.pos, c.tan, this.drift);

        // Куда смотрит лицо персонажа (нужно ракурсу «лицо крупно»)
        const yaw = this.hero.group.rotation.y;
        c.face.set(Math.sin(yaw), 0, Math.cos(yaw));
        c.distance = this.distance;
    }

    startShot(index) {
        this.shotIndex = index;
        this.shotTime = 0;
        const shot = SHOTS[index];
        if (shot.setup) shot.setup(this.ctx);
    }

    updateCamera() {
        const shot = SHOTS[this.shotIndex];
        const k = THREE.MathUtils.smoothstep(this.shotTime / shot.dur, 0, 1);   // плавный прогресс
        const c = this.ctx;
        const cam = this.world.camera;

        shot.frame(c, k);
        cam.position.copy(c.camPos);
        cam.lookAt(c.camLook);
        cam.fov = THREE.MathUtils.lerp(shot.fov[0], shot.fov[1], k);            // медленный зум
        cam.updateProjectionMatrix();
    }

    computeFlash() {
        const shot = SHOTS[this.shotIndex];
        const toEnd = shot.dur - this.shotTime;
        const isLast = this.shotIndex === SHOTS.length - 1;

        // Конец кадра: плавно нарастает к склейке (в последнем кадре не нужно)
        if (!isLast && toEnd < RISE) {
            return THREE.MathUtils.smoothstep(1 - toEnd / RISE, 0, 1);
        }
        // Начало кадра: быстро и плавно гаснет (в самом первом кадре не нужно)
        if (this.shotIndex > 0 && this.shotTime < FALL) {
            return 1 - THREE.MathUtils.smoothstep(this.shotTime / FALL, 0, 1);
        }
        return 0;
    }

    applyFlash(f) {
        this.lights.setFlash(f);
        // Пересвет самой картинки, без него вспышка выглядит слабо
        this.world.renderer.domElement.style.filter = f > 0.001 ? `brightness(${1 + f * 1.2})` : "";
    }

    start() {
        this.isRunning = true;
        this.time = 0;
        this.resetHero();
        this.startShot(0);
        this.updateCamera();
        this.world.controls.enabled = false;
        this.button.disabled = true;
        this.button.textContent = "Идёт...";
    }

    stop() {
        this.isRunning = false;
        this.world.controls.enabled = true;
        this.button.disabled = false;
        this.button.textContent = "Анимация";
        this.applyFlash(0);
        this.world.resetCamera();
        this.resetHero();
    }

    update(dt) {
        this.time += dt;
        if (this.time >= this.totalDuration) {
            this.stop();
            return;
        }

        this.distance += this.speed * dt;
        this.placeHero(dt);

        this.shotTime += dt;
        if (this.shotTime >= SHOTS[this.shotIndex].dur) {
            this.startShot(Math.min(this.shotIndex + 1, SHOTS.length - 1));   // жёсткая склейка
        }
        this.updateCamera();
        this.applyFlash(this.computeFlash());
    }
}