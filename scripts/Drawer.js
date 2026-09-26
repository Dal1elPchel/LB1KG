export class Drawer {
    constructor(canvas, ctx, SCALE, points, bones) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.points = points;
        this.bones = bones;
        this.SCALE = SCALE;

        this.zoom = 1;
        this.minZoom = 0.5;
        this.maxZoom = 2.5;
        this.zoomStep = 0.2;

        this.rotation = 0;
    }

    rotatePoint(point) {
        if (this.rotation === 0) return point;
        const cos = Math.cos(this.rotation);
        const sin = Math.sin(this.rotation);
        return {
            X: point.X * cos - point.Y * sin,
            Y: point.X * sin + point.Y * cos
        };
    }

    worldToCanvas(point) {
        const rotated = this.rotatePoint(point);
        return {
            X: (rotated.X * this.zoom + this.canvas.width / this.SCALE) / 2,
            Y: (this.canvas.height / this.SCALE - rotated.Y * this.zoom) / 2
        };
    }

    setZoom(value) {
        const clamped = Math.min(this.maxZoom, Math.max(this.minZoom, value));
        if (clamped === this.zoom) return;
        this.zoom = clamped;
        this.draw();
    }

    zoomIn() {
        this.setZoom(this.zoom + this.zoomStep);
    }

    zoomOut() {
        this.setZoom(this.zoom - this.zoomStep);
    }

    rotateBy(deltaRadians) {
        if (deltaRadians === 0) return;
        const TWO_PI = Math.PI * 2;
        this.rotation = (this.rotation + deltaRadians) % TWO_PI;
        this.draw();
    }

    drawAxes() {
        this.ctx.save();
        this.ctx.strokeStyle = 'rgba(150, 150, 150, 0.5)'; // мягкий полупрозрачный серый
        this.ctx.fillStyle = 'rgba(150, 150, 150, 0.5)';
        this.ctx.lineWidth = 1;

        const origin = this.worldToCanvas({ X: 0, Y: 0 });
        const arrowSize = 8;

        this.drawArrowLine(0, origin.Y, this.canvas.width, origin.Y, arrowSize);
        this.drawArrowLine(origin.X, this.canvas.height, origin.X, 0, arrowSize);
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

    draw() {

        this.ctx.clearRect(0, 0,
            this.canvas.width, this.canvas.height);

        this.drawAxes();

        this.ctx.strokeStyle = 'black';

        for (const [i, j] of this.bones) {
            let point1 = this.worldToCanvas(this.points[i]);
            let point2 = this.worldToCanvas(this.points[j]);
            this.ctx.beginPath();
            this.ctx.moveTo(point1.X, point1.Y);
            this.ctx.lineTo(point2.X, point2.Y);
            this.ctx.stroke();
        }
    }
}