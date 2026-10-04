const DEPTH_TOLERANCE = 0.005;

export class ZBuffer {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.data = new Float32Array(width * height);
        this.clear();
    }

    clear() {
        this.data.fill(-Infinity);
    }

    fillPolygon(poly) {
        let minY = Infinity, maxY = -Infinity;
        for (const p of poly) {
            minY = Math.min(minY, p.y);
            maxY = Math.max(maxY, p.y);
        }
        const yStart = Math.max(0, Math.ceil(minY));
        const yEnd = Math.min(this.height - 1, Math.floor(maxY));

        for (let y = yStart; y <= yEnd; y++) {
            const hits = [];
            for (let i = 0; i < poly.length; i++) {
                const a = poly[i];
                const b = poly[(i + 1) % poly.length];
                if ((a.y <= y) === (b.y <= y)) continue;
                const t = (y - a.y) / (b.y - a.y);
                hits.push({x: a.x + (b.x - a.x) * t, w: a.w + (b.w - a.w) * t});
            }

            hits.sort((p, q) => p.x - q.x);

            for (let k = 0; k + 1 < hits.length; k += 2) {
                const left = hits[k];
                const right = hits[k + 1];
                const xStart = Math.max(0, Math.ceil(left.x));
                const xEnd = Math.min(this.width - 1, Math.floor(right.x));
                const span = right.x - left.x;

                for (let x = xStart; x <= xEnd; x++) {
                    const t = span === 0 ? 0 : (x - left.x) / span;
                    const w = left.w + (right.w - left.w) * t;

                    const idx = y * this.width + x;
                    if (w > this.data[idx]) this.data[idx] = w;
                }
            }
        }
    }

    isVisible(x, y, w) {
        if (x < 0 || y < 0 || x >= this.width || y >= this.height) return false;
        return w >= this.data[y * this.width + x] * (1 - DEPTH_TOLERANCE);
    }
}