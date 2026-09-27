import {Camera} from "./Camera.js";
import {Renderer} from "./Renderer.js";

export class Drawer {
    constructor(canvas, ctx, SCALE, points, bones, sideIndices) {
        this.points = points;
        this.bones = bones;
        this.sideIndices = sideIndices;

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

    averageZ(indices) {
        const sum = indices.reduce((acc, i) => {
            const rotated = this.camera.rotatePoint(this.points[i]);
            return acc + rotated.Z;
        }, 0);
        return sum / indices.length;
    }

    draw() {
        this.renderer.clearRect();
        this.renderer.drawAxes();


        const frontZ = this.averageZ(this.sideIndices.frontIndices);
        const backZ = this.averageZ(this.sideIndices.backIndices);

        // рисуем кости той группы, что в среднем ближе к камере (больше Z)
        const visibleBones = frontZ >= backZ ? this.bones.front : this.bones.back;

        this.renderer.draw(this.points, [...visibleBones, ...this.bones.bridge]);
    }
}