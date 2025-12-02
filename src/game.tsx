import { ACCENT_COLOR, PRIMARY_COLOR, SECONDARY_COLOR } from "./colors";
import { soundEffects } from "./soundPool";

type Bullet = {
    x: number;
    y: number;
    r: number;
    color: string;
    speed: number;
};

type InputBit = {
    x: number;
    y: number;
    w: number;
    h: number;
    active: boolean;
    value: number;
    color: string;
};

type DecimalBit = {
    x: number;
    y: number;
    w: number;
    h: number;
    value: number;
    color: string;
};

type Star = {
    x: number;
    y: number;
    r: number;
    speed: number;
};

type Player = {
    x: number;
    y: number;
    w: number;
    h: number;
    speed: number;
};

export type GameUpdate = {
    points: number;
    level: number;
    life: number;
    time: number;
}

export function game(
    canvas: HTMLCanvasElement,
    onGameOver: (points: number, level: number) => void,
    onMessage: (message: { type: "success" | "error" | "info", content: string }) => void,
    onGameUpdate: (update: GameUpdate) => void,
    getLastBinary: (bin: string) => void,
    getGoalAndCurrNumber: (values: { goal: number; current: number }) => void
) {
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    const maxSeconds = 10;
    const bullet_speed = 25;
    const player_speed = 10;
    const STARS_INCREASE = 15;
    let lastShot = 0;
    const SHOT_DELAY = 25; // ms

    const DECIMAL_COLOR = PRIMARY_COLOR;
    const INPUT_COLOR = SECONDARY_COLOR;
    const BULLET_COLOR = ACCENT_COLOR;
    const COLLISION_COLOR = ACCENT_COLOR;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const player: Player = { x: 280, y: canvas.height - 10, w: 40, h: 40, speed: player_speed };
    const playerImage = new Image();

    playerImage.src = "/images/ship_1.png";

    window.addEventListener("resize", () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });

    function randomInt(max: number) {
        return Math.floor(Math.random() * max) + 1;
    }

    let level = 1;
    let potency = 3;
    let currentNumber = 0;
    let randomNumber = randomInt(Math.pow(2, potency) - 1);
    let seconds = maxSeconds;
    let points = 0;
    let life = 3;
    let stars_amount = 25;

    let inputs: InputBit[] = [];
    let decimals: DecimalBit[] = [];
    let stars: Star[] = [];
    let baseW = Math.floor(canvas.width / potency);
    let remainder = canvas.width - baseW * potency;

    let interval: number | undefined;
    let animationId: number;

    onGameUpdate({ points, level, life, time: seconds });
    getGoalAndCurrNumber({ goal: randomNumber, current: getCurrentNumber() });

    function drawInputsAndDecimals() {
        inputs = [];
        decimals = [];
        baseW = Math.floor(canvas.width / potency);
        remainder = canvas.width - baseW * potency;

        let value = Math.pow(2, potency - 1);
        let accX = 0;

        for (let i = 0; i < potency; i++) {
            let w = baseW;
            if (i === potency - 1) w += remainder;
            decimals.push({ x: accX, y: 0, w, h: 20, value: value, color: DECIMAL_COLOR });
            accX += w;
            value = value / 2;
        }

        value = Math.pow(2, potency - 1);
        accX = 0;

        for (let i = 0; i < potency; i++) {
            let w = baseW;
            if (i === potency - 1) w += remainder;
            inputs.push({ x: accX, y: 20, w, h: 50, active: false, value, color: INPUT_COLOR });
            accX += w;
            value = value / 2;
        }
    }

    drawInputsAndDecimals();

    let bullets: Bullet[] = [];
    let keys: Record<string, boolean> = {};

    // fire
    document.addEventListener("keydown", e => {
        keys[e.code] = true;
        if (e.code === "Space" || e.code === "KeyJ") {
            soundEffects.fire.play();
            const now = performance.now();
            if (now - lastShot < SHOT_DELAY) return;
            lastShot = now;

            bullets.push({
                x: player.x + player.w / 2,
                y: player.y,
                r: 6,
                color: BULLET_COLOR,
                speed: bullet_speed
            });
        }
    });

    document.addEventListener("keyup", e => { keys[e.code] = false; });

    function detectCollisions() {
        bullets = bullets.filter(bullet => {
            let hit = false;
            for (const input of inputs) {
                if (bullet.x + bullet.r > input.x && bullet.x - bullet.r < input.x + input.w &&
                    bullet.y + bullet.r > input.y && bullet.y - bullet.r < input.y + input.h) {
                    input.active = !input.active;
                    hit = true;
                    input.color = COLLISION_COLOR;
                    soundEffects.hit.play();
                    setTimeout(() => {
                        input.color = INPUT_COLOR;
                    }, 25);
                    break;
                }
            }
            getGoalAndCurrNumber({ goal: randomNumber, current: getCurrentNumber() });
            return !hit;
        });
    }

    function getCurrentNumber() {
        currentNumber = 0;
        for (let i = 0; i < inputs.length; i++) if (inputs[i].active) currentNumber += inputs[i].value;
        return currentNumber;
    }

    function getCurrentBinaryNumber() {
        let bin = "";
        for (let i = 0; i < inputs.length; i++)
            if (inputs[i].active) bin += "1"
            else bin += "0";
        return bin;
    }

    function gameOver() {
        draw();
        cancelAnimationFrame(animationId);
        clearInterval(interval);
        soundEffects.gameover.play();
        onGameOver(points, level);
        life = 3;
        potency = 3;
        points = 0;
        randomNumber = randomInt(Math.pow(2, potency) - 1);
        getGoalAndCurrNumber({ goal: randomNumber, current: getCurrentNumber() });
        drawInputsAndDecimals();
    }

    function levelUp() {
        if (points % 5 == 0) {
            soundEffects.level.play();
            level++;
            stars_amount += STARS_INCREASE;
            setStars();
            onMessage({ type: "success", content: "Level up!" });
            onGameUpdate({ points, level, life, time: seconds });
            playerImage.src = `/images/ship_${level < 8 ? level : 8}.png`;
            if (potency <= 8) {
                potency++;
            }
        }
    }

    function reset(success: boolean) {
        if (success) {
            soundEffects.score.play();
            points++;
            onGameUpdate({ points, level, life, time: seconds });
            onMessage({ type: "success", content: "Good job!" });
            levelUp();
        } else {
            soundEffects.timeout.play();
            life--;
            onGameUpdate({ points, level, life, time: seconds });
            onMessage({ type: "error", content: "Time's up!" });
            if (life == 0) {
                gameOver();
            }
        }
        getLastBinary(getCurrentBinaryNumber());
        drawInputsAndDecimals();
        inputs.forEach(input => input.active = false);
        let lastRandomNumber = randomNumber;
        do {
            randomNumber = randomInt(Math.pow(2, potency) - 1);
        } while (randomNumber == lastRandomNumber);
        seconds = maxSeconds;
        getGoalAndCurrNumber({ goal: randomNumber, current: getCurrentNumber() });
    }

    function writeSomething(content: string, size: number, x: number, y: number, align: CanvasTextAlign, color: string) {
        ctx.fillStyle = color;
        ctx.font = `${size}px Arial`;
        ctx.textAlign = align;
        ctx.textBaseline = "middle";
        ctx.fillText(content, x, y);
    }

    function drawPlayer(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
        ctx.drawImage(playerImage, x, y - h, w, h);
    }

    function update() {
        if (keys["KeyA"]) {
            player.x -= player.speed;
            if (player.x + player.w < 0) player.x = canvas.width;
        } else if (keys["KeyD"]) {
            player.x += player.speed;
            if (player.x > canvas.width) player.x = -player.w;
        }

        bullets.forEach(b => b.y -= b.speed);
        bullets = bullets.filter(b => b.y + b.r > 0);
        detectCollisions();
    }

    function setStars() {
        stars = [];
        for (let i = 0; i < stars_amount; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                r: Math.random() * 2 + 1,
                speed: Math.random() * 2 + 1
            });
        }
    }

    function updateStars() {
        stars.forEach(star => {
            star.y += star.speed;
            if (star.y > canvas.height) star.y = 0;
        });
    }

    function drawStars() {
        ctx.fillStyle = "white";
        stars.forEach(star => {
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // const canvasMiddleX = canvas.width / 2;
        // const canvasMiddleY = canvas.height / 2;

        drawStars();
        drawPlayer(ctx, player.x, player.y, player.w, player.h);

        getCurrentNumber();

        for (const decimal of decimals) {
            ctx.fillStyle = decimal.color;
            ctx.fillRect(decimal.x, decimal.y, decimal.w, decimal.h);
            writeSomething(decimal.value.toString(), potency < 7 ? 14 : 12, decimal.x + decimal.w / 2, decimal.y + decimal.h / 2, "center", "#eee");
        }

        for (const input of inputs) {
            ctx.fillStyle = input.color;
            ctx.fillRect(input.x, input.y, input.w, input.h);
            writeSomething(input.active ? "1" : "0", potency < 7 ? 24 : 18, input.x + input.w / 2, input.y + input.h / 2, "center", "#eee");
        }

        bullets.forEach(b => {
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
            ctx.fillStyle = b.color;
            ctx.fill();
        });

        // writeSomething(`${getCurrentNumber()} - ${randomNumber}`, 60, canvasMiddleX, canvasMiddleY, "center", "white");

        if (getCurrentNumber() == randomNumber) {
            reset(true);
        }
    }

    function gameLoop() {
        updateStars();
        update();
        draw();
        animationId = requestAnimationFrame(gameLoop);
    }

    function createTimer() {
        interval = window.setInterval(() => {
            seconds--;
            onGameUpdate({ points, level, life, time: seconds });

            if (seconds == 3) {
                soundEffects.alarm.play();
            }

            if (seconds <= 0) {
                reset(false);
            }
        }, 1000);
    }

    function startGame() {
        setStars();
        gameLoop();
        createTimer();
    }

    startGame();
}