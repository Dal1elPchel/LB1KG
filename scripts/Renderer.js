import {ZBuffer} from "./Zbufer.js";

export class Renderer {
    constructor(canvas, ctx, camera) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.camera = camera;
        this.zBuffer = new ZBuffer(canvas.width, canvas.height);
    }

    get viewWidth() {
        return this.canvas.width / this.camera.SCALE;
    }

    get viewHeight() {
        return this.canvas.height / this.camera.SCALE;
    }

    clearRect() {
        this.ctx.clearRect(0, 0, this.viewWidth, this.viewHeight);
    }

    drawAxes() {
        this.ctx.save();
        this.ctx.strokeStyle = 'rgba(150, 150, 150, 0.5)';
        this.ctx.fillStyle = 'rgba(150, 150, 150, 0.5)';
        this.ctx.lineWidth = 1;

        const origin = this.camera.worldToCanvas({X: 0, Y: 0, Z: 0});
        const arrowSize = 8;

        this.drawArrowLine(0, origin.Y, this.viewWidth, origin.Y, arrowSize);
        this.drawArrowLine(origin.X, this.viewHeight, origin.X, 0, arrowSize);

        this.ctx.restore();
    }

    drawArrowLine(x1, y1, x2, y2, arrowSize) {
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();

        const angle = Math.atan2(y2 - y1, x2 - x1);
        this.ctx.beginPath();
        this.ctx.moveTo(x2, y2);
        this.ctx.lineTo(
            x2 - arrowSize * Math.cos(angle - Math.PI / 6),
            y2 - arrowSize * Math.sin(angle - Math.PI / 6)
        );
        this.ctx.lineTo(
            x2 - arrowSize * Math.cos(angle + Math.PI / 6),
            y2 - arrowSize * Math.sin(angle + Math.PI / 6)
        );
        this.ctx.closePath();
        this.ctx.fill();
    }

    project(point) {
        const c = this.camera.worldToCanvas(point);
        const S = this.camera.SCALE;
        return {
            x: c.X * S,
            y: c.Y * S,
            w: 1 / (this.camera.distance - c.Z),
        };
    }

    draw(points, bones, faces) {
        const projected = points.map(p => this.project(p));

        this.zBuffer.clear();
        for (const face of faces) {
            this.zBuffer.fillPolygon(face.map(i => projected[i]));
        }

        this.ctx.save();
        this.ctx.strokeStyle = 'black';
        this.ctx.beginPath();
        for (const [i, j] of bones) {
            this.addVisibleParts(projected[i], projected[j]);
        }
        this.ctx.stroke();
        this.ctx.restore();
    }

    addVisibleParts(p1, p2) {
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const steps = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dy))));

        let runStart = null;
        let lastVisible = null;

        for (let k = 0; k <= steps; k++) {
            const t = k / steps;
            const x = Math.round(p1.x + dx * t);
            const y = Math.round(p1.y + dy * t);
            const w = p1.w + (p2.w - p1.w) * t;

            const visible = this.zBuffer.isVisible(x, y, w);

            if (visible) {
                if (runStart === null) runStart = t;
                lastVisible = t;
            }
            if ((!visible || k === steps) && runStart !== null) {
                this.addSegment(p1, p2, runStart, lastVisible);
                runStart = null;
            }
        }
    }

    addSegment(p1, p2, t0, t1) {
        const S = this.camera.SCALE;
        this.ctx.moveTo((p1.x + (p2.x - p1.x) * t0) / S, (p1.y + (p2.y - p1.y) * t0) / S);
        this.ctx.lineTo((p1.x + (p2.x - p1.x) * t1) / S, (p1.y + (p2.y - p1.y) * t1) / S);
    }
}