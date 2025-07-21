const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

const PADDLE_WIDTH = 12;
const PADDLE_HEIGHT = 100;
const PADDLE_MARGIN = 20;
const BALL_RADIUS = 10;

// Game objects
let leftPaddle = {
    x: PADDLE_MARGIN,
    y: HEIGHT/2 - PADDLE_HEIGHT/2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    color: '#4FFF4F'
};

let rightPaddle = {
    x: WIDTH - PADDLE_MARGIN - PADDLE_WIDTH,
    y: HEIGHT/2 - PADDLE_HEIGHT/2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    color: '#FF4F4F'
};

let ball = {
    x: WIDTH/2,
    y: HEIGHT/2,
    vx: 6 * (Math.random() > 0.5 ? 1 : -1),
    vy: randomVy(),
    radius: BALL_RADIUS,
    color: '#00FF00'
};

// Ensures min vertical speed and never zero
function randomVy() {
    let vy = (Math.random() - 0.5) * 8; // -4 to 4
    if (Math.abs(vy) < 2) vy = 2 * (vy < 0 ? -1 : 1); // min speed
    return vy;
}

// Draw paddle
function drawPaddle(p) {
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, p.width, p.height);
}

// Draw ball
function drawBall(b) {
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
    ctx.fillStyle = b.color;
    ctx.fill();
    ctx.closePath();
}

// Reset ball to center
function resetBall() {
    ball.x = WIDTH/2;
    ball.y = HEIGHT/2;
    ball.vx = 6 * (Math.random() > 0.5 ? 1 : -1);
    ball.vy = randomVy();
    ball.color = '#00FF00';
}

// Game loop
function gameLoop() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    // Draw paddles and ball
    drawPaddle(leftPaddle);
    drawPaddle(rightPaddle);
    drawBall(ball);

    // Move ball
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Ball collision with top/bottom walls
    if (ball.y - ball.radius <= 0 || ball.y + ball.radius >= HEIGHT) {
        ball.vy = -ball.vy;
        // If still perfectly horizontal, force a nudge
        if (Math.abs(ball.vy) < 1) ball.vy = randomVy();
        ball.color = "#1E90FF";
    }

    // Ball collision with paddles
    // Left paddle
    if (
        ball.x - ball.radius < leftPaddle.x + leftPaddle.width &&
        ball.y > leftPaddle.y &&
        ball.y < leftPaddle.y + leftPaddle.height
    ) {
        ball.x = leftPaddle.x + leftPaddle.width + ball.radius; // Prevent sticking
        ball.vx = Math.abs(ball.vx); // always right
        // Add some spin based on where the ball hits the paddle
        let collidePoint = ball.y - (leftPaddle.y + leftPaddle.height / 2);
        collidePoint = collidePoint / (leftPaddle.height/2);
        ball.vy = 5 * collidePoint;
        // If perfectly center, force a vertical movement
        if (Math.abs(ball.vy) < 1) ball.vy = randomVy();
        ball.color = "#FFD700";
    }
    // Right paddle
    if (
        ball.x + ball.radius > rightPaddle.x &&
        ball.y > rightPaddle.y &&
        ball.y < rightPaddle.y + rightPaddle.height
    ) {
        ball.x = rightPaddle.x - ball.radius; // Prevent sticking
        ball.vx = -Math.abs(ball.vx); // always left
        let collidePoint = ball.y - (rightPaddle.y + rightPaddle.height / 2);
        collidePoint = collidePoint / (rightPaddle.height/2);
        ball.vy = 5 * collidePoint;
        if (Math.abs(ball.vy) < 1) ball.vy = randomVy();
        ball.color = "#FF69B4";
    }

    // Ball out of bounds (left or right)
    if (ball.x < 0 || ball.x > WIDTH) {
        resetBall();
    }

    // AI for right paddle
    let targetY = Math.max(0, Math.min(HEIGHT - rightPaddle.height, ball.y - rightPaddle.height/2));
    let aiSpeed = 5;
    if (rightPaddle.y < targetY) {
        rightPaddle.y += aiSpeed;
        if (rightPaddle.y > targetY) rightPaddle.y = targetY;
    } else if (rightPaddle.y > targetY) {
        rightPaddle.y -= aiSpeed;
        if (rightPaddle.y < targetY) rightPaddle.y = targetY;
    }

    requestAnimationFrame(gameLoop);
}

// Mouse controls for left paddle
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    let mouseY = e.clientY - rect.top;
    leftPaddle.y = mouseY - leftPaddle.height / 2;
    leftPaddle.y = Math.max(0, Math.min(HEIGHT - leftPaddle.height, leftPaddle.y));
});

// Start the loop
gameLoop();