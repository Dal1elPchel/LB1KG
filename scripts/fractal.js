
const EDGES = [[1, 2], [32, 33]];
const BASE = [21, 13];


function segmentToSegment(a, b, A, B) {
    const k = Math.hypot(B.X - A.X, B.Y - A.Y) / Math.hypot(b.X - a.X, b.Y - a.Y);
    const theta = Math.atan2(B.Y - A.Y, B.X - A.X) - Math.atan2(b.Y - a.Y, b.X - a.X);
    const cos = Math.cos(theta);
    const sin = Math.sin(theta);

    return (p) => {
        const x = (p.X - a.X) * k;
        const y = (p.Y - a.Y) * k;
        return {
            X: x * cos - y * sin + A.X,
            Y: x * sin + y * cos + A.Y,
            Z: p.Z * k,
        };
    };
}

export function buildFractal(model, depth) {
    const points = [];
    const bones = [];

    const baseA = model.points[BASE[0] - 1];
    const baseB = model.points[BASE[1] - 1];

    function addRobot(transform, level) {
        const offset = points.length;

        model.points.forEach(p => points.push(transform(p)));
        model.bones.forEach(([i, j]) => bones.push([i + offset, j + offset]));

        if (level === 0) return;

        for (const [n1, n2] of EDGES) {
            const A = points[offset + n1 - 1];
            const B = points[offset + n2 - 1];
            addRobot(segmentToSegment(baseA, baseB, A, B), level - 1);
        }
    }

    addRobot(p => ({...p}), depth);
    return {points, bones};
}