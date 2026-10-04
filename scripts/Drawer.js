import {Camera} from "./Camera.js";
import {Renderer} from "./Renderer.js";

export class Drawer {

    constructor(canvas, ctx, SCALE, points, bones, focal) {
        this.points = points;
        this.bones = bones;

        this.camera = new Camera(canvas, SCALE, focal);
        this.renderer = new Renderer(canvas, ctx, this.camera);
    }

    setFocal(value) {
        if (this.camera.setFocal(value)) this.draw();
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

        this.renderer.draw(this.points, this.bones);
    }
}