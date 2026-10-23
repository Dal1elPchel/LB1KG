import {Camera} from "./Camera.js";
import {Renderer} from "./Renderer.js";
import {buildFractal} from "./fractal.js";
export const MAX_DEPTH = 6;
export class Drawer {

    constructor(canvas, ctx, SCALE, model) {
        this.model = model;
        this.depth = 0;
        this.fractal = buildFractal(model, this.depth);

        this.camera = new Camera(canvas, SCALE);
        this.renderer = new Renderer(canvas, ctx, this.camera);
    }

    setDepth(depth) {
        const d = Math.min(MAX_DEPTH, Math.max(0, depth));
        if (d === this.depth) return false;

        this.depth = d;
        this.fractal = buildFractal(this.model, d);
        this.draw();
        return true;
    }

    zoomIn()  {
        if (this.camera.zoomIn()) this.draw();
    }


    zoomOut()  {
        if (this.camera.zoomOut()) this.draw();
    }

    rotateBy(axis, deltaRadians) {
        if (this.camera.rotateBy(axis, deltaRadians)) this.draw();
    }


    moveBy(dx, dy) {
        if (this.camera.moveBy(dx, dy)) this.draw();
    }

    draw() {
        this.renderer.clearRect();
        this.renderer.drawAxes();

        this.renderer.draw(this.fractal.points, this.fractal.bones);
    }
}