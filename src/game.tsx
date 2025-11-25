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

export function game(canvas: HTMLCanvasElement, onGameOver: () => void, onMessage: (message: string) => void) {
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    const maxSeconds = 11;
    const bullet_speed = 25;
    const player_speed = 10;
    const STARS_INCREASE = 15;
    let lastShot = 0;
    const SHOT_DELAY = 25; // ms

    const DECIMAL_COLOR = PRIMARY_COLOR;
    const INPUT_COLOR = SECONDARY_COLOR;
    const BULLET_COLOR = ACCENT_COLOR;
    const COLLISION_COLOR = "#F1E0A3";
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const player: Player = { x: 280, y: canvas.height - 10, w: 40, h: 40, speed: player_speed };
    const playerImages = {
        straight: new Image(),
        left: new Image(),
        right: new Image()
    }

    playerImages.straight.src = "/images/ship.png"
    playerImages.left.src = "/images/ship_left.png"
    playerImages.right.src = "/images/ship_right.png"

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
    let playerState: "straight" | "left" | "right" = "straight";

    let inputs: InputBit[] = [];
    let decimals: DecimalBit[] = [];
    let stars: Star[] = [];
    let baseW = Math.floor(canvas.width / potency);
    let remainder = canvas.width - baseW * potency;

    let interval: number | undefined;
    let animationId: number;

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
            return !hit;
        });
    }

    function getCurrentNumber() {
        currentNumber = 0;
        for (let i = 0; i < inputs.length; i++) if (inputs[i].active) currentNumber += inputs[i].value;
        return currentNumber;
    }

    function gameOver() {
        cancelAnimationFrame(animationId);
        clearInterval(interval);
        life = 3;
        potency = 3;
        points = 0;
        randomNumber = randomInt(Math.pow(2, potency) - 1);
        drawInputsAndDecimals();
        soundEffects.gameover.play();
        onGameOver();
    }

    function levelUp() {
        if (points % 5 == 0) {
            soundEffects.level.play();
            level++;
            stars_amount += STARS_INCREASE;
            setStars();
            onMessage("Level up!");
            if (potency <= 8) {
                potency++;
            }
            drawInputsAndDecimals();
        }
    }

    function reset(success: boolean) {
        let keepNumber = false;
        if (success) {
            soundEffects.score.play();
            points++;
            onMessage("Good job!");
            levelUp();
        } else {
            soundEffects.timeout.play();
            life--;
            keepNumber = true;
            onMessage("Time's up");
            if (life == 0) {
                gameOver();
            }
        }
        inputs.forEach(input => input.active = false);
        randomNumber = keepNumber ? randomNumber : randomInt(Math.pow(2, potency) - 1);
        seconds = maxSeconds;
    }

    function writeSomething(content: string, size: number, x: number, y: number, align: CanvasTextAlign, color: string) {
        ctx.fillStyle = color;
        ctx.font = `${size}px Arial`;
        ctx.textAlign = align;
        ctx.textBaseline = "middle";
        ctx.fillText(content, x, y);
    }

    function drawPlayer(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
        const img = playerImages[playerState];
        ctx.drawImage(img, x, y - h, w, h);
    }

    function update() {
        if (keys["KeyA"]) {
            playerState = "left";
            player.x -= player.speed;
            if (player.x + player.w < 0) player.x = canvas.width;
        } else if (keys["KeyD"]) {
            playerState = "right";
            player.x += player.speed;
            if (player.x > canvas.width) player.x = -player.w;
        } else {
            playerState = "straight";
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

        writeSomething(`${getCurrentNumber()} - ${randomNumber}`, 60, canvas.width / 2, canvas.height / 2, "center", "white");
        writeSomething(`Time: ${seconds}`, 16, 5, canvas.height - 70, "left", "white");
        writeSomething(`Life: ${life}`, 16, 5, canvas.height - 40, "left", "white");
        writeSomething(`Level: ${level}`, 16, 5, canvas.height - 10, "left", "white");

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