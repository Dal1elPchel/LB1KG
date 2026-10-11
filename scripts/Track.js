import * as THREE from "three";
import {TRACK_POINTS, ROAD_HALF} from "./trackData.js";

export class Track {
    constructor() {
        this.curve = new THREE.CatmullRomCurve3(
            TRACK_POINTS.map(([x, z]) => new THREE.Vector3(x, 0, z)),
            true
        );

        this.group = new THREE.Group();
        this.group.add(
            this.buildRoad(),
            this.buildEdge(1, 0xff4fd8),
            this.buildEdge(-1, 0x00e5ff),
            this.buildGround()
        );
    }

    get length() {
        return this.curve.getLength();
    }

    pointAt(u, target) {
        return this.curve.getPointAt(u % 1, target);
    }

    tangentAt(u, target) {
        return this.curve.getTangentAt(u % 1, target);
    }

    buildRoad() {
        const N = 400;
        const pos = [];
        const idx = [];
        const p = new THREE.Vector3();
        const t = new THREE.Vector3();

        for (let i = 0; i < N; i++) {
            this.curve.getPointAt(i / N, p);
            this.curve.getTangentAt(i / N, t);
            const nx = -t.z;
            const nz = t.x;

            pos.push(
                p.x + nx * ROAD_HALF, 0, p.z + nz * ROAD_HALF,
                p.x - nx * ROAD_HALF, 0, p.z - nz * ROAD_HALF
            );

            const a = i * 2;
            const b = i * 2 + 1;
            const c = ((i + 1) % N) * 2;
            const d = ((i + 1) % N) * 2 + 1;
            idx.push(a, c, b, b, c, d);
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
        geo.setIndex(idx);
        geo.computeVertexNormals();

        return new THREE.Mesh(
            geo,
            new THREE.MeshLambertMaterial({color: 0x2a2a38, side: THREE.DoubleSide})
        );
    }

    buildEdge(side, color) {
        const pts = [];
        const p = new THREE.Vector3();
        const t = new THREE.Vector3();
        for (let i = 0; i <= 300; i++) {
            const u = (i / 300) % 1;
            this.curve.getPointAt(u, p);
            this.curve.getTangentAt(u, t);
            pts.push(new THREE.Vector3(
                p.x - t.z * ROAD_HALF * side,
                0.5,
                p.z + t.x * ROAD_HALF * side
            ));
        }
        return new THREE.Line(
            new THREE.BufferGeometry().setFromPoints(pts),
            new THREE.LineBasicMaterial({color})
        );
    }

    buildGround() {
        const ground = new THREE.Mesh(
            new THREE.PlaneGeometry(4000, 4000),
            new THREE.MeshLambertMaterial({color: 0x1b1530})
        );
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -1;
        return ground;
    }
}