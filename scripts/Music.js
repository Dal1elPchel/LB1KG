const START_AT = 0;    // с какой секунды трека начинать (можно подобрать «дроп» под начало ролика)
const MAX_VOLUME = 0.8;

export class Music {
    constructor(src) {
        this.audio = new Audio(src);
        this.audio.preload = "auto";   // начать грузить заранее, чтобы при нажатии не было задержки
        this.audio.volume = MAX_VOLUME;
    }

    play() {
        this.audio.currentTime = START_AT;
        this.audio.volume = MAX_VOLUME;
        // play() возвращает промис: он падает, если файла нет или браузер запретил звук
        this.audio.play().catch((err) => console.warn("Музыку не удалось включить:", err));
    }

    // v от 0 до 1, доля от максимальной громкости (нужно для затухания в конце)
    setVolume(v) {
        this.audio.volume = MAX_VOLUME * Math.min(1, Math.max(0, v));
    }

    stop() {
        this.audio.pause();
        this.audio.currentTime = START_AT;
    }
}