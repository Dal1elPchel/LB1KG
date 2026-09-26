"use strict";

import {Drawer} from "./scripts/Drawer.js";

const boneNumbers = [
    // голова
    [33, 1], [1, 2], [2, 3], [3, 4], [4, 5],
    [29, 30], [30, 31], [31, 32], [32, 33],
    [5, 6], [29, 28], [29, 5],

    // "глаза" внутри головы
    [34, 35], [35, 36], [36, 34],
    [37, 39], [39, 38], [38, 37],

    // верх туловища
    [27, 28], [28, 6], [6, 7],

    // левое плечо/рука
    [27, 24], [24, 23], [23, 18],
    [24, 25], [25, 26], [26, 27],

    // правое плечо/рука
    [7, 10], [10, 11], [11, 16],
    [10, 9], [9, 8], [8, 7],

    // бёдра/таз
    [18, 17], [17, 16],

    // левая нога
    [23, 22], [18, 19], [22, 19], [22, 21], [19, 20], [21, 20],

    // правая нога
    [16, 15], [11, 12], [15, 12], [15, 14], [12, 13], [14, 13],

    // "нашивка" на груди
    [48, 42], [49, 52], [50, 53],
    [42, 52], [52, 53], [53, 43],
    [40, 54], [54, 55], [55, 41],
    [44, 40], [45, 54], [46, 55],
    [40, 44], [51, 43], [43, 41],
    [42, 40], [41, 47],
];

const points = [
    {X: 40, Y: 144},   // 1
    {X: 64, Y: 120},   // 2
    {X: 64, Y: 40},    // 3
    {X: 40, Y: 16},    // 4
    {X: 24, Y: 16},    // 5
    {X: 24, Y: -8},    // 6
    {X: 80, Y: -8},   // 7
    {X: 80, Y: -88},  // 8
    {X: 56, Y: -88},  // 9
    {X: 56, Y: -32},  // 10
    {X: 32, Y: -56},   // 11
    {X: 32, Y: -136},  // 12
    {X: 32, Y: -144},  // 13
    {X: 8, Y: -144},  // 14
    {X: 8, Y: -136},  // 15
    {X: 8, Y: -80},   // 16
    {X: 0, Y: -88},   // 17
    {X: -8, Y: -80},  // 18
    {X: -8, Y: -136}, // 19
    {X: -8, Y: -144}, // 20
    {X: -32, Y: -144}, // 21
    {X: -32, Y: -136}, // 22
    {X: -32, Y: -56},  // 23
    {X: -56, Y: -32}, // 24
    {X: -56, Y: -88}, // 25
    {X: -80, Y: -88}, // 26
    {X: -80, Y: -8},  // 27
    {X: -24, Y: -8},   // 28
    {X: -24, Y: 16},   // 29
    {X: -40, Y: 16},   // 30
    {X: -64, Y: 40},   // 31
    {X: -64, Y: 120},  // 32
    {X: -40, Y: 144},  // 33
    {X: -56, Y: 120},  // 34
    {X: -8, Y: 120},  // 35
    {X: -8, Y: 72},   // 36
    {X: 8, Y: 120},   // 37
    {X: 8, Y: 72},    // 38
    {X: 56, Y: 120},   // 39
    {X: 8, Y: -24},   // 40
    {X: 8, Y: -48},   // 41
    {X: -8, Y: -24},  // 42
    {X: -8, Y: -48},  // 43
    {X: 16, Y: -24},   // 44
    {X: 16, Y: -32},   // 45
    {X: 16, Y: -40},   // 46
    {X: 16, Y: -48},   // 47
    {X: -16, Y: -24},  // 48
    {X: -16, Y: -32},  // 49
    {X: -16, Y: -40},  // 50
    {X: -16, Y: -48},  // 51
    {X: -8, Y: -32},  // 52
    {X: -8, Y: -40},  // 53
    {X: 8, Y: -32},   // 54
    {X: 8, Y: -40},   // 55
];

const bones = boneNumbers.map(([a, b]) => [a - 1, b - 1]);


const canvas = document.getElementById("game");

const ctx = canvas.getContext('2d');
const SCALE = 3;

ctx.scale(SCALE, SCALE);

const drawer = new Drawer(canvas, ctx, SCALE, points, bones);

drawer.draw();

document.getElementById("zoomIn").addEventListener("click", () => drawer.zoomIn());
document.getElementById("zoomOut").addEventListener("click", () => drawer.zoomOut());


const ROTATE_SPEED = Math.PI / 1.5;

let rotationDirection = 0;
let lastTimestamp = null;
let rafId = null;

function rotationLoop(timestamp) {
    if (lastTimestamp === null) lastTimestamp = timestamp;
    const dt = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;

    if (rotationDirection !== 0) {
        drawer.rotateBy(rotationDirection * ROTATE_SPEED * dt);
    }

    rafId = requestAnimationFrame(rotationLoop);
}

function startRotating(direction) {
    rotationDirection = direction;
    if (rafId === null) {
        lastTimestamp = null;
        rafId = requestAnimationFrame(rotationLoop);
    }
}

function stopRotating() {
    rotationDirection = 0;
    if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
    }
}

function bindHoldRotation(buttonId, direction) {
    const button = document.getElementById(buttonId);

    button.addEventListener("mousedown", () => startRotating(direction));
    button.addEventListener("touchstart", (e) => {
        e.preventDefault();
        startRotating(direction);
    }, {passive: false});

}

bindHoldRotation("rotateLeft", 1);
bindHoldRotation("rotateRight", -1);

window.addEventListener("mouseup", stopRotating);
window.addEventListener("touchend", stopRotating);
window.addEventListener("touchcancel", stopRotating);