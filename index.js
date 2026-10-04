"use strict";

import {Drawer} from "./scripts/Drawer.js";
import {buildModel} from "./scripts/model.js";
import {setupControls} from "./scripts/controls.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext('2d');
const SCALE = 3;
ctx.scale(SCALE, SCALE);


const {points, bones, faces, focal} = buildModel();
const drawer = new Drawer(canvas, ctx, SCALE, points, bones, faces, focal);

drawer.draw();
setupControls(drawer);
