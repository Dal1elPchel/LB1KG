import {World} from "./scripts/World.js";
import {Actor} from "./scripts/Actor.js";
import {Lights} from "./scripts/Lights.js";
import {BallsGenerator} from "./scripts/BallsGenerator.js";
import {Counter} from "./scripts/Counter.js";
import {createControls} from "./scripts/controls.js";

const canvas = document.getElementById("game");

const world = new World(canvas);
const actor = new Actor(world.renderer);
const lights = new Lights();

world.add(actor.person);
world.add(lights.lights);

const counter = new Counter(document.getElementById('counter'));
const ballGenerator = new BallsGenerator(world, counter);

createControls(world, ballGenerator, actor);