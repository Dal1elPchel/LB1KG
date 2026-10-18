import * as THREE from "three";
import {outline, DEPTH, eyes, patchPoints, patchBones} from "./model.js";

export class Actor {
    constructor(renderer) {
        this.renderer = renderer
        this.geometry = this.#createShapeAndGeometry();
        this.personCarcas = this.#createTexture();
        this.personCarcas.material = new THREE.MeshLambertMaterial({color: 0xa259ff});
        this.eyes = this.#createEyes();
        this.patches = this.#createPatches();

        this.person = new THREE.Group();
        this.person.add(this.personCarcas, ...this.eyes, ...this.patches);
    }

    moveX(direction, dt) {
        const speed = 900;
        const limit = 510;
        const dx = (direction === "left" ? -1 : 1) * speed * dt;
        this.person.position.x = THREE.MathUtils.clamp(this.person.position.x + dx, -limit, limit);
    }

    #createShapeAndGeometry() {
        const shape = new THREE.Shape(outline.map(p => new THREE.Vector2(p.X, p.Y)));
        const geometry = new THREE.ExtrudeGeometry(shape, {depth: DEPTH * 2, bevelEnabled: false});
        geometry.translate(0, 0, -DEPTH);
        return geometry;
    }

    #createTexture() {
        const loader = new THREE.TextureLoader();
        const maxAniso = this.renderer.capabilities.getMaxAnisotropy();

        const loadTex = (url, tileSize) => {
            const t = loader.load(url);
            t.wrapS = t.wrapT = THREE.RepeatWrapping;
            t.repeat.set(1 / tileSize, 1 / tileSize);
            t.colorSpace = THREE.SRGBColorSpace;
            t.anisotropy = maxAniso;
            return t;
        }

        const makeMaterial = ({color = 0xffffff, texture = null} = {}) => {
            return new THREE.MeshLambertMaterial({color, map: texture});
        }

        const mesh = new THREE.Mesh(this.geometry, [
            makeMaterial({}),
            makeMaterial({}),
        ]);

        return mesh;
    }

    #createEyes() {
        const meshes = [];
        const eyeMaterial = new THREE.MeshLambertMaterial({color: 0xc6ff3d, side: THREE.DoubleSide});

        for (const triangle of eyes) {
            const eyeShape = new THREE.Shape(triangle.map(p => new THREE.Vector2(p.X, p.Y)));
            const eye = new THREE.Mesh(new THREE.ShapeGeometry(eyeShape), eyeMaterial);
            eye.position.z = DEPTH + 0.5;
            meshes.push(eye);
        }
        return meshes;
    }

    #createPatches() {
        const allParts = [];
        const patchShape = new THREE.Shape([
            new THREE.Vector2(-16, -24),
            new THREE.Vector2(16, -24),
            new THREE.Vector2(16, -48),
            new THREE.Vector2(-16, -48),
        ]);
        const patch = new THREE.Mesh(
            new THREE.ShapeGeometry(patchShape),
            new THREE.MeshLambertMaterial({color: 0xff4fd8, side: THREE.DoubleSide})
        );
        patch.position.z = DEPTH + 0.5;
        allParts.push(patch);
        const linePoints = [];
        for (const [a, b] of patchBones) {
            linePoints.push(
                new THREE.Vector3(patchPoints[a].X, patchPoints[a].Y, 0),
                new THREE.Vector3(patchPoints[b].X, patchPoints[b].Y, 0)
            );
        }
        const patchLines = new THREE.LineSegments(
            new THREE.BufferGeometry().setFromPoints(linePoints),
            new THREE.LineBasicMaterial({color: 0x000000})
        );
        patchLines.position.z = DEPTH + 1;
        allParts.push(patchLines);

        return allParts;
    }
}