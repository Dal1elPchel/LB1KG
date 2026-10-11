export class AnimationController {
    constructor(world, button, duration = 4) {
        this.world = world;
        this.button = button;
        this.duration = duration;
        this.time = 0;
        this.isRunning = false;

        button.addEventListener("click", () => this.start());
    }

    start() {
        this.isRunning = true;
        this.time = 0;
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
    }

    update(dt) {
        this.time += dt;
        if (this.time >= this.duration) this.stop();
    }
}