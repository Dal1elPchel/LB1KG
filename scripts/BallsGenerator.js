import {Ball} from "./Ball.js";
import * as THREE from "three";

export class BallsGenerator {
    constructor(world,
                counter,
                {interval = 1,
                    minX = -500,
                    maxX = 500,
                    groundY = -200} = {},) {
        this.world = world;
        this.counter = counter;
        this.interval = interval;
        this.minX = minX;
        this.maxX = maxX;
        this.groundY = groundY;
        this.timer = 0;
        this.balls = [];
    }

    update(dt, box, onCatch) {
        this.timer += dt;
        if (this.timer >= this.interval) {
            this.timer -= this.interval;
            const x = this.minX + Math.random() * (this.maxX - this.minX);
            const ball = new Ball(x);
            this.balls.push(ball);
            this.world.add(ball.mesh);
        }

        for (let i = this.balls.length - 1; i >=0; i--) {
            const ball = this.balls[i];
            ball?.moveY(dt);
            if (this.#ballHitsBox(ball, box)) {
                this.world.remove(ball.mesh);
                this.balls.splice(i, 1);
                onCatch();
            } else if (ball.getPosY() <= this.groundY) {
                this.world.remove(ball.mesh);
                this.counter.count += 1;
                this.balls.splice(i, 1);
            }
        }
    }

    stop() {
        this.balls.forEach(ball => this.world.remove(ball.mesh));
        this.balls = [];
        this.counter.reload();
    }

    #ballHitsBox(ball, box, radius = 30) {
        if (ball) {
            const p = ball.mesh.position;
            const cx = THREE.MathUtils.clamp(p.x, box.min.x, box.max.x);
            const cy = THREE.MathUtils.clamp(p.y, box.min.y, box.max.y);
            const dx = p.x - cx;
            const dy = p.y - cy;
            return dx * dx + dy * dy <= radius * radius;
        }
    }
}