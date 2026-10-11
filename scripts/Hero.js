import * as THREE from "three";
import {outline, DEPTH, eyes, patchPoints, patchBones} from "./model.js";

export const HERO_SCALE = 0.3;
const FEET_OFFSET = 144 * HERO_SCALE;

export class Hero {
    constructor() {
        this.group = new THREE.Group();
        this.body = new THREE.Group();
        this.body.scale.setScalar(HERO_SCALE);
        this.group.add(this.body);

        this.body.add(this.buildBody());
        this.buildEyes().forEach(eye => this.body.add(eye));
        this.body.add(this.buildPatch());
        this.body.add(this.buildPatchLines());
    }

    buildBody() {
        const shape = new THREE.Shape(outline.map(p => new THREE.Vector2(p.X, p.Y)));
        const geometry = new THREE.ExtrudeGeometry(shape, {depth: DEPTH * 2, bevelEnabled: false});
        geometry.translate(0, 0, -DEPTH);
        return new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({color: 0xa259ff}));
    }

    buildEyes() {
        const material = new THREE.MeshLambertMaterial({color: 0xc6ff3d, side: THREE.DoubleSide});
        return eyes.map(triangle => {
            const shape = new THREE.Shape(triangle.map(p => new THREE.Vector2(p.X, p.Y)));
            const eye = new THREE.Mesh(new THREE.ShapeGeometry(shape), material);
            eye.position.z = DEPTH + 0.5;
            return eye;
        });
    }

    buildPatch() {
        const shape = new THREE.Shape([
            new THREE.Vector2(-16, -24),
            new THREE.Vector2(16, -24),
            new THREE.Vector2(16, -48),
            new THREE.Vector2(-16, -48),
        ]);
        const patch = new THREE.Mesh(
            new THREE.ShapeGeometry(shape),
            new THREE.MeshLambertMaterial({color: 0xff4fd8, side: THREE.DoubleSide})
        );
        patch.position.z = DEPTH + 0.5;
        return patch;
    }

    buildPatchLines() {
        const points = [];
        for (const [a, b] of patchBones) {
            points.push(
                new THREE.Vector3(patchPoints[a].X, patchPoints[a].Y, 0),
                new THREE.Vector3(patchPoints[b].X, patchPoints[b].Y, 0)
            );
        }
        const lines = new THREE.LineSegments(
            new THREE.BufferGeometry().setFromPoints(points),
            new THREE.LineBasicMaterial({color: 0x000000})
        );
        lines.position.z = DEPTH + 1;
        return lines;
    }

    placeAt(position, tangent, drift = 0) {
        this.group.position.set(position.x, FEET_OFFSET, position.z);
        this.group.rotation.y = Math.atan2(tangent.x, tangent.z) + drift;
        this.body.rotation.z = drift * 0.25;
    }
}