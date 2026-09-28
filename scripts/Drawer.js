import {Camera} from "./Camera.js";
import {Renderer} from "./Renderer.js";

export class Drawer {
    constructor(canvas, ctx, SCALE, points, model) {
        this.points = points;
        this.model = model;

        this.camera = new Camera(canvas, SCALE);
        this.renderer = new Renderer(canvas, ctx, this.camera);
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

    draw() {
        this.renderer.clearRect();
        this.renderer.drawAxes();
        this.renderer.draw(this.points, this.model);
    }
}