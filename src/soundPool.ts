class SoundPool {
    pool: HTMLAudioElement[];

    constructor(src: string, size: number) {
        this.pool = Array.from({ length: size }, () => new Audio(src));
    }

    play() {
        const a = this.pool.find(x => x.paused);
        if (a) {
            a.currentTime = 0;
            a.play();
            return;
        }

        const clone = this.pool[0].cloneNode() as HTMLAudioElement;
        clone.currentTime = 0;
        clone.play();
        this.pool.push(clone);
    }
}

export const soundEffects = {
    alarm: new SoundPool("/sound_effects/alarm.wav", 1),
    fire: new SoundPool("/sound_effects/fire.wav", 5),
    hit: new SoundPool("/sound_effects/hit.wav", 5),
    gameover: new SoundPool("/sound_effects/gameover.wav", 1),
    level: new SoundPool("/sound_effects/level.wav", 1),
    score: new SoundPool("/sound_effects/score.wav", 1),
    start: new SoundPool("/sound_effects/start.wav", 1),
    timeout: new SoundPool("/sound_effects/timeout.wav", 1)
};
