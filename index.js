
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

const material = new THREE.MeshLambertMaterial({color: 0xa259ff});
const HERO_SCALE = 1;               // пока 1, уменьшим на шаге 3, когда появится трасса

const hero = new THREE.Group();     // внешняя группа: ею мы будем двигать и поворачивать персонажа
const body = new THREE.Group();     // внутренняя: тут лежат все части, и она отвечает за масштаб
body.scale.setScalar(HERO_SCALE);
hero.add(body);
scene.add(hero);


body.add(new THREE.Mesh(geometry, material));
const eyeMaterial = new THREE.MeshLambertMaterial({color: 0xc6ff3d, side: THREE.DoubleSide});

for (const triangle of eyes) {
    const eyeShape = new THREE.Shape(triangle.map(p => new THREE.Vector2(p.X, p.Y)));
    const eye = new THREE.Mesh(new THREE.ShapeGeometry(eyeShape), eyeMaterial);
    eye.position.z = DEPTH + 0.5;
    body.add(eye);
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
body.add(patch);
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
body.add(patchLines);

scene.add(new THREE.AmbientLight(0xffffff, 0.5));
const sun = new THREE.DirectionalLight(0xffffff, 2.5);
sun.position.set(200, 300, 400);
scene.add(sun);

const sunMarker = new THREE.Mesh(
    new THREE.SphereGeometry(8, 16, 16),
    new THREE.MeshBasicMaterial({color: 0xffe600})   // Basic = не зависит от света, всегда яркий
);
sunMarker.position.copy(sun.position);
scene.add(sunMarker);

// ---------- Движение солнца кнопками ----------
const LIGHT_SPEED = 200;   // единиц в секунду
const LIGHT_LIMIT = 800;   // дальше этого солнце не уйдёт

let activeMove = null;     // что сейчас зажато: {axis: "x", dir: 1} или null

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


// ---------- Режим анимации (пока пустой каркас) ----------
const ANIM_DURATION = 4;             // длина ролика в секундах (потом заменим на настоящую)
const DEFAULT_CAM = {x: 150, y: 100, z: 600};

const animBtn = document.getElementById("animBtn");
let animMode = false;                // идёт ли ролик сейчас
let animTime = 0;                    // сколько секунд прошло с начала ролика

function startAnimation() {
    animMode = true;
    animTime = 0;
    controls.enabled = false;        // мышь не управляет камерой
    animBtn.disabled = true;         // повторно запустить нельзя
    animBtn.textContent = "Идёт...";
}

function stopAnimation() {
    animMode = false;
    controls.enabled = true;         // мышь снова работает
    animBtn.disabled = false;
    animBtn.textContent = "Анимация";

    camera.position.set(DEFAULT_CAM.x, DEFAULT_CAM.y, DEFAULT_CAM.z);   // камера в обычное положение
    controls.target.set(0, 0, 0);    // и смотрит на центр
    controls.update();
}

function updateAnimation(dt) {
    animTime += dt;
    if (animTime >= ANIM_DURATION) stopAnimation();
}

animBtn.addEventListener("click", startAnimation);
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const dt = Math.min(clock.getDelta(), 0.1);   // секунд с прошлого кадра

    if (activeMove) {
        const {axis, dir} = activeMove;
        const value = sun.position[axis] + dir * LIGHT_SPEED * dt;
        sun.position[axis] = THREE.MathUtils.clamp(value, -LIGHT_LIMIT, LIGHT_LIMIT);
        sunMarker.position.copy(sun.position);
    }

    if (animMode) updateAnimation(dt);
    else controls.update();
    renderer.render(scene, camera);
}
animate();