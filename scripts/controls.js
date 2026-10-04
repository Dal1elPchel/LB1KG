const ROTATE_SPEED = Math.PI / 1.5;
const MOVE_SPEED = 120;

export function setupControls(drawer) {
    let activeAction = null;
    let lastTimestamp = null;
    let rafId = null;

    function holdLoop(timestamp) {
        if (lastTimestamp === null) lastTimestamp = timestamp;
        const dt = (timestamp - lastTimestamp) / 1000;
        lastTimestamp = timestamp;

        if (activeAction) {
            activeAction(dt);
        }

        rafId = requestAnimationFrame(holdLoop);
    }

    function startHolding(action) {
        activeAction = action;
        if (rafId === null) {
            lastTimestamp = null;
            rafId = requestAnimationFrame(holdLoop);
        }
    }

    function stopHolding() {
        activeAction = null;
        if (rafId !== null) {
            cancelAnimationFrame(rafId);
            rafId = null;
        }
    }

    function bindHold(buttonId, action) {
        const button = document.getElementById(buttonId);

        button.addEventListener("mousedown", () => startHolding(action));
        button.addEventListener("touchstart", (e) => {
            e.preventDefault();
            startHolding(action);
        }, {passive: false});
    }

    document.getElementById("zoomIn").addEventListener("click", () => drawer.zoomIn());
    document.getElementById("zoomOut").addEventListener("click", () => drawer.zoomOut());

    const rotateButtons = [
        ["rotateYLeft", "Y", 1], ["rotateYRight", "Y", -1],
        ["rotateXUp",   "X", 1], ["rotateXDown",  "X", -1],
        ["rotateZLeft", "Z", 1], ["rotateZRight", "Z", -1],
    ];
    rotateButtons.forEach(([id, axis, dir]) => {
        bindHold(id, (dt) => drawer.rotateBy(axis, dir * ROTATE_SPEED * dt));
    });

    const moveButtons = [
        ["moveUp",    0,  1], ["moveDown",  0, -1],
        ["moveLeft", -1,  0], ["moveRight", 1,  0],
    ];
    moveButtons.forEach(([id, dx, dy]) => {
        bindHold(id, (dt) => drawer.moveBy(dx * MOVE_SPEED * dt, dy * MOVE_SPEED * dt));
    });

    window.addEventListener("mouseup", stopHolding);
    window.addEventListener("touchend", stopHolding);
    window.addEventListener("touchcancel", stopHolding);

    const focalSlider = document.getElementById("focalLength");
    const focalValue = document.getElementById("focalLengthValue");

    focalValue.textContent = focalSlider.value;
    focalSlider.addEventListener("input", () => {
        const value = Number(focalSlider.value);
        focalValue.textContent = value;
        drawer.setFocal(value);
    });
}