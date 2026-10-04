export class Renderer {
    constructor(canvas, ctx, camera) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.camera = camera;
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

    draw(points, bones) {
        this.ctx.save();
        this.ctx.strokeStyle = 'black';

        for (const [i, j] of bones) {
            const p1 = this.camera.worldToCanvas(points[i]);
            const p2 = this.camera.worldToCanvas(points[j]);

            this.ctx.beginPath();
            this.ctx.moveTo(p1.X, p1.Y);
            this.ctx.lineTo(p2.X, p2.Y);
            this.ctx.stroke();
        }

        this.ctx.restore();
    }
}