import * as THREE from "three";

export function createControls(world, ballGenerator, actor) {
    const clock = new THREE.Clock();
    const keys = new Set();

    window.addEventListener("keydown", (e) => {
        if (e.code === "ArrowLeft" || e.code === "ArrowRight") {
            e.preventDefault();
            keys.add(e.code);
        }
    });
    window.addEventListener("keyup", (e) => keys.delete(e.code));
    window.addEventListener("blur", () => keys.clear());
    const modal = document.querySelector(".modal");
    const modalCounter = document.getElementById("counter_modal");

    function showModal(score) {
        modalCounter.textContent = score;
        modal.classList.add("modal--open");
    }

    document.querySelector(".modal_close").addEventListener("click", () => {
        modal.classList.remove("modal--open");
    });

    let running = false;
    function stopGame() {
        running=false;
        showModal(ballGenerator.counter.count);
        ballGenerator.stop();
    }

    document.getElementById('start').addEventListener('click', () => running=true);
    document.getElementById('stop').addEventListener('click', () => {
        stopGame();
    });

    const box = new THREE.Box3().setFromObject(actor.person);
    function animate() {
        requestAnimationFrame(animate);
        const dt = clock.getDelta();

        if (keys.has("ArrowLeft"))  actor.moveX("left", dt);
        if (keys.has("ArrowRight")) actor.moveX("right", dt);
        box.setFromObject(actor.personCarcas);
        if (running) ballGenerator.update(dt, box, stopGame);
        world.render();
    }


    animate();

}