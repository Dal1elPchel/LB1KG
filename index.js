import * as THREE from "three";
import {World} from "./scripts/World.js";
import {Track} from "./scripts/Track.js";
import {Hero} from "./scripts/Hero.js";
import {Lights} from "./scripts/Lights.js";
import {AnimationController} from "./scripts/AnimationController.js";
import {Music} from "./scripts/Music.js";

const world = new World(document.getElementById("game"));
const track = new Track();
const hero = new Hero();
const lights = new Lights();

world.add(track.group);
world.add(hero.group);
world.add(lights.group);

lights.bindButtons();
const music = new Music("./scripts/audio/track.mp3");
const animation = new AnimationController(world, document.getElementById("animBtn"), track, hero, lights, music);

animation.resetHero();
const {pos, face} = animation.ctx;
world.setHome(
    new THREE.Vector3().copy(pos).addScaledVector(face, 220).setY(80),   // 220 вперёд от лица, высота 80
    new THREE.Vector3(pos.x, 45, pos.z)                                  // смотрим в центр тела
);

const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const dt = Math.min(clock.getDelta(), 0.1);

    lights.update(dt);

    if (animation.isRunning) animation.update(dt);
    else world.controls.update();

    world.render();
}
animate();