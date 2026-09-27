export class Renderer {
    constructor(canvas, ctx, camera) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.camera = camera;
    }

    clearRect() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawAxes() {
        this.ctx.save();
        this.ctx.strokeStyle = 'rgba(150, 150, 150, 0.5)';
        this.ctx.fillStyle = 'rgba(150, 150, 150, 0.5)';
        this.ctx.lineWidth = 1;

        const origin = this.camera.worldToCanvas({ X: 0, Y: 0 });
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

    draw(points, bones) {
        this.ctx.strokeStyle = 'black';

        const projected = bones.map(([i, j]) => {
            const point1 = this.camera.worldToCanvas(points[i]);
            const point2 = this.camera.worldToCanvas(points[j]);
            return {point1, point2, avgZ: (point1.Z + point2.Z) / 2};
        });

        projected.sort((a, b) => a.avgZ - b.avgZ);
        for (const {point1, point2} of projected) {
            this.ctx.beginPath();
            this.ctx.moveTo(point1.X, point1.Y);
            this.ctx.lineTo(point2.X, point2.Y);
            this.ctx.stroke();
        }
    }
}