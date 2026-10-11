import * as THREE from "three";

const UP = new THREE.Vector3(0, 1, 0);
const side = new THREE.Vector3();

// c = контекст от контроллера:
//   c.pos, c.tan   позиция и направление дороги под персонажем
//   c.face         куда смотрит лицо персонажа (с учётом заноса)
//   c.camPos, c.camLook   сюда ракурс записывает результат
// k = прогресс внутри кадра от 0 до 1 (уже сглаженный)

export const SHOTS = [
    {   // 1. погоня сзади
        dur: 2.6, fov: [65, 55],
        frame(c) {
            c.camPos.copy(c.pos).addScaledVector(c.tan, -150).addScaledVector(UP, 70);
            c.camLook.copy(c.pos).addScaledVector(c.tan, 80).addScaledVector(UP, 40);
        },
    },
    {   // 2. сбоку, как съёмка колеса: камера едет рядом и медленно обгоняет персонажа
        dur: 2.2, fov: [48, 34],
        frame(c, k) {
            side.set(-c.tan.z, 0, c.tan.x);
            c.camPos.copy(c.pos)
                .addScaledVector(side, 110)
                .addScaledVector(c.tan, THREE.MathUtils.lerp(-40, 40, k))
                .addScaledVector(UP, 22);
            c.camLook.copy(c.pos).addScaledVector(UP, 38);
        },
    },
    {   // 3. спереди, лицо крупно
        dur: 2.0, fov: [45, 32],
        frame(c) {
            c.camPos.copy(c.pos).addScaledVector(c.face, 100).addScaledVector(UP, 72);
            c.camLook.copy(c.pos).addScaledVector(UP, 72);
        },
    },
    {   // 4. сверху, как с дрона
        dur: 2.4, fov: [60, 60],
        frame(c) {
            c.camPos.copy(c.pos).addScaledVector(c.tan, -60).addScaledVector(UP, 520);
            c.camLook.copy(c.pos);
        },
    },
    {   // 5. камера стоит у обочины, персонаж проносится мимо
        dur: 2.4, fov: [50, 28],
        setup(c) {   // вызывается один раз в начале кадра: выбираем, где поставить камеру
            const u = (c.distance + c.speed * 1.2) / c.trackLength;   // точка, где персонаж будет в середине кадра
            c.track.pointAt(u, c.anchor);
            c.track.tangentAt(u, c.tmp);
            c.anchor.x += -c.tmp.z * 130;   // отойти от дороги вбок
            c.anchor.z += c.tmp.x * 130;
            c.anchor.y = 30;
        },
        frame(c) {
            c.camPos.copy(c.anchor);
            c.camLook.copy(c.pos).addScaledVector(UP, 40);
        },
    },
];