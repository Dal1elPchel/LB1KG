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

        const w = this.canvas.width / this.camera.SCALE;
        const h = this.canvas.height / this.camera.SCALE;

        this.drawArrowLine(0, origin.Y, w, origin.Y, arrowSize);
        this.drawArrowLine(origin.X, h, origin.X, 0, arrowSize);
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

    draw(points, {caps, walls}) {
        const cam = this.camera;
        const EPS = 1e-6;

        const project = i => cam.worldToCanvas(points[i]);
        const depthOf = i => cam.rotatePoint(points[i]).Z;

        const visibleWalls = walls
            .filter(w => cam.rotatePoint(w.normal).Z > EPS)
            .map(w => ({
                w,
                depth: w.vertices.reduce((s, i) => s + depthOf(i), 0) / w.vertices.length,
            }))
            .sort((a, b) => a.depth - b.depth);

        for (const {w} of visibleWalls) {
            this.fillPolygon(w.vertices.map(project));
        }

        const frontFacing = cam.rotatePoint({X: 0, Y: 0, Z: 1}).Z > 0;
        const cap = frontFacing ? caps.front : caps.back;
        this.fillPolygon(cap.vertices.map(project));

        this.ctx.strokeStyle = 'black';
        for (const [a, b] of cap.bones) {
            const p1 = project(a);
            const p2 = project(b);
            this.ctx.beginPath();
            this.ctx.moveTo(p1.X, p1.Y);
            this.ctx.lineTo(p2.X, p2.Y);
            this.ctx.stroke();
        }
    }

    fillPolygon(vertices) {
        this.ctx.beginPath();
        this.ctx.moveTo(vertices[0].X, vertices[0].Y);
        for (let k = 1; k < vertices.length; k++) {
            this.ctx.lineTo(vertices[k].X, vertices[k].Y);
        }
        this.ctx.closePath();
        this.ctx.fillStyle = '#ffffff'; // цвет фона canvas
        this.ctx.fill();
        this.ctx.strokeStyle = 'black';
        this.ctx.stroke();
    }
}