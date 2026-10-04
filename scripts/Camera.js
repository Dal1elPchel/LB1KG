export class Camera {
    constructor(canvas, scale, focal) {
        this.canvas = canvas;
        this.SCALE = scale;

        this.zoom = 1;
        this.minZoom = 0.5;
        this.maxZoom = 2.5;
        this.zoomStep = 0.2;

        this.rotation = {X: 0, Y: 0, Z: 0};
        this.offset = {X: 0, Y: 0};

        this.MIN_DISTANCE = 200;
        this.focalLength = focal;
    }

    get distance() {
        return Math.max(this.focalLength, this.MIN_DISTANCE);
    }

    rotatePoint(point) {
        let x = point.X;
        let y = point.Y;
        let z = point.Z || 0;

        if (this.rotation.X !== 0) {
            const cos = Math.cos(this.rotation.X);
            const sin = Math.sin(this.rotation.X);
            [y, z] = [y * cos - z * sin, y * sin + z * cos];
        }

        if (this.rotation.Y !== 0) {
            const cos = Math.cos(this.rotation.Y);
            const sin = Math.sin(this.rotation.Y);
            [x, z] = [x * cos + z * sin, -x * sin + z * cos];
        }

        if (this.rotation.Z !== 0) {
            const cos = Math.cos(this.rotation.Z);
            const sin = Math.sin(this.rotation.Z);
            [x, y] = [x * cos - y * sin, x * sin + y * cos];
        }

        return {X: x, Y: y, Z: z};
    }

    setFocal(value) {
        if (value === this.focalLength) return false;
        this.focalLength = value;
        return true;
    }

    worldToCanvas(point) {
        const rotated = this.rotatePoint(point);

        const x = rotated.X + this.offset.X;
        const y = rotated.Y + this.offset.Y;

        const depth = this.distance - rotated.Z;

        const scale = this.zoom * this.focalLength / depth;


        return {
            X: (x * scale + this.canvas.width / this.SCALE) / 2,
            Y: (this.canvas.height / this.SCALE - y * scale) / 2,
            Z: rotated.Z
        };
    }

    setZoom(value) {
        const clamped = Math.min(this.maxZoom, Math.max(this.minZoom, value));
        if (clamped === this.zoom) return false;
        this.zoom = clamped;
        return true;
    }

    zoomIn() {
        return this.setZoom(this.zoom + this.zoomStep);
    }

    zoomOut() {
        return this.setZoom(this.zoom - this.zoomStep);
    }

    rotateBy(axis, deltaRadians) {
        if (deltaRadians === 0) return false;
        const TWO_PI = Math.PI * 2;
        this.rotation[axis] = (this.rotation[axis] + deltaRadians) % TWO_PI;
        return true;
    }

    moveBy(dx, dy) {
        if (dx === 0 && dy === 0) return false;
        this.offset.X += dx;
        this.offset.Y += dy;
        return true;
    }
}