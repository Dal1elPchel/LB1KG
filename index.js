
import * as THREE from "three";
import {OrbitControls} from "three/addons/controls/OrbitControls.js";
import {outline, DEPTH, eyes, patchPoints, patchBones} from "./scripts/model.js";

const canvas = document.getElementById("game");

const renderer = new THREE.WebGLRenderer({canvas, antialias: true});
renderer.setSize(canvas.width, canvas.height, false);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

const camera = new THREE.PerspectiveCamera(50, canvas.width / canvas.height, 1, 5000);
camera.position.set(150, 100, 600);

const controls = new OrbitControls(camera, canvas);

const shape = new THREE.Shape(outline.map(p => new THREE.Vector2(p.X, p.Y)));
const geometry = new THREE.ExtrudeGeometry(shape, {depth: DEPTH * 2, bevelEnabled: false});
geometry.translate(0, 0, -DEPTH);

const loader = new THREE.TextureLoader();
const maxAniso = renderer.capabilities.getMaxAnisotropy();

function loadTex(url, tileSize) {
    const t = loader.load(url);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(1 / tileSize, 1 / tileSize);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = maxAniso;
    return t;
}

function makeMaterial({color = 0xffffff, texture = null} = {}) {
    return new THREE.MeshLambertMaterial({color, map: texture});
}

const mesh = new THREE.Mesh(geometry, [
    makeMaterial({color: 0xa259ff, texture: loadTex("textures/fabric.jpg", 64)}),
    makeMaterial({color: 0xa259ff, texture: loadTex("textures/fabric.jpg", 32)}),
]);

scene.add(mesh);

const eyeMaterial = new THREE.MeshLambertMaterial({color: 0xc6ff3d, side: THREE.DoubleSide});

for (const triangle of eyes) {
    const eyeShape = new THREE.Shape(triangle.map(p => new THREE.Vector2(p.X, p.Y)));
    const eye = new THREE.Mesh(new THREE.ShapeGeometry(eyeShape), eyeMaterial);
    eye.position.z = DEPTH + 0.5;
    scene.add(eye);
}

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
scene.add(patch);
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
scene.add(patchLines);

scene.add(new THREE.AmbientLight(0xffffff, 0.5));
const sun = new THREE.DirectionalLight(0xffffff, 2.5);
sun.position.set(200, 300, 400);
scene.add(sun);

const sunMarker = new THREE.Mesh(
    new THREE.SphereGeometry(8, 16, 16),
    new THREE.MeshBasicMaterial({color: 0xffe600})
);
sunMarker.position.copy(sun.position);
scene.add(sunMarker);

const LIGHT_SPEED = 200;
const LIGHT_LIMIT = 800;

let activeMove = null;

function bindLightButton(id, axis, dir) {
    document.getElementById(id).addEventListener("pointerdown", (e) => {
        e.preventDefault();
        activeMove = {axis, dir};
    });
}

bindLightButton("lightXMinus", "x", -1);
bindLightButton("lightXPlus",  "x",  1);
bindLightButton("lightYMinus", "y", -1);
bindLightButton("lightYPlus",  "y",  1);
bindLightButton("lightZMinus", "z", -1);
bindLightButton("lightZPlus",  "z",  1);

const stopMove = () => { activeMove = null; };
window.addEventListener("pointerup", stopMove);
window.addEventListener("pointercancel", stopMove);
window.addEventListener("blur", stopMove);

document.getElementById('fabricTexture').addEventListener('click',
    () => {setTexture('fabric')});

document.getElementById('metalTexture').addEventListener('click',
    () => {setTexture('metal')});

const setTexture = (texture) => {
    const mat = mesh.material[0];
    mat.map = loadTex(`textures/${texture}.jpg`, 64);
    mat.needsUpdate = true;
}

const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const dt = Math.min(clock.getDelta(), 0.1);

    if (activeMove) {
        const {axis, dir} = activeMove;
        const value = sun.position[axis] + dir * LIGHT_SPEED * dt;
        sun.position[axis] = THREE.MathUtils.clamp(value, -LIGHT_LIMIT, LIGHT_LIMIT);
        sunMarker.position.copy(sun.position);
    }

    controls.update();
    renderer.render(scene, camera);
}
animate();