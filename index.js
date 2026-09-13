"use strict";

import {Drawer} from "./scripts/Drawer.js";
const canvas = document.getElementById("game");

const ctx = canvas.getContext('2d');

ctx.scale(3, 3);

const drawer = new Drawer(canvas, ctx);

drawer.draw();