const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('startButton');
const restartButton = document.getElementById('restartButton');
const scoreElement = document.getElementById('score');

// Mobile control buttons
const upBtn = document.getElementById('upBtn');
const downBtn = document.getElementById('downBtn');
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');

// Set canvas size
canvas.width = 400;
canvas.height = 400;

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [];
let food = {};
let dx = gridSize;
let dy = 0;
let score = 0;
let gameLoop = null;
let gameStarted = false;
let isGameOver = false;

// Touch handling variables
let touchStartX = 0;
let touchStartY = 0;
const minSwipeDistance = 30; // Minimum distance for a swipe

// Prevent arrow key scrolling globally
window.addEventListener("keydown", function(e) {
    if(["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].indexOf(e.code) > -1) {
        e.preventDefault();
    }
}, false);

// Initialize game
function initGame() {
    snake = [
        { x: 5 * gridSize, y: 5 * gridSize }
    ];
    generateFood();
    score = 0;
    scoreElement.textContent = score;
    dx = gridSize;
    dy = 0;
    isGameOver = false;
}

// Generate food at random position
function generateFood() {
    food = {
        x: Math.floor(Math.random() * tileCount) * gridSize,
        y: Math.floor(Math.random() * tileCount) * gridSize
    };
    
    // Make sure food doesn't appear on snake
    for (let segment of snake) {
        if (segment.x === food.x && segment.y === food.y) {
            generateFood();
            break;
        }
    }
}

// Game loop
function gameUpdate() {
    // Move snake
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    
    // Check for wall collision
    if (head.x >= canvas.width || head.x < 0 || head.y >= canvas.height || head.y < 0) {
        gameOver();
        return;
    }
    
    // Check for self collision
    for (let segment of snake) {
        if (head.x === segment.x && head.y === segment.y) {
            gameOver();
            return;
        }
    }
    
    snake.unshift(head);
    
    // Check for food collision
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreElement.textContent = score;
        generateFood();
    } else {
        snake.pop();
    }
    
    // Draw everything
    draw();
}

// Draw game elements
function draw() {
    // Clear canvas
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw snake body
    for (let i = snake.length - 1; i >= 0; i--) {
        const segment = snake[i];
        
        if (i === 0) {
            // Draw head
            ctx.fillStyle = '#2E7D32'; // Darker green for head
            ctx.beginPath();
            ctx.arc(segment.x + gridSize/2, segment.y + gridSize/2, gridSize/2, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw eyes
            ctx.fillStyle = 'white';
            const eyeSize = 4;
            // Left eye
            ctx.beginPath();
            if (dx > 0) { // Moving right
                ctx.arc(segment.x + gridSize - 6, segment.y + 6, eyeSize, 0, Math.PI * 2);
                ctx.arc(segment.x + gridSize - 6, segment.y + gridSize - 6, eyeSize, 0, Math.PI * 2);
            } else if (dx < 0) { // Moving left
                ctx.arc(segment.x + 6, segment.y + 6, eyeSize, 0, Math.PI * 2);
                ctx.arc(segment.x + 6, segment.y + gridSize - 6, eyeSize, 0, Math.PI * 2);
            } else if (dy < 0) { // Moving up
                ctx.arc(segment.x + 6, segment.y + 6, eyeSize, 0, Math.PI * 2);
                ctx.arc(segment.x + gridSize - 6, segment.y + 6, eyeSize, 0, Math.PI * 2);
            } else { // Moving down
                ctx.arc(segment.x + 6, segment.y + gridSize - 6, eyeSize, 0, Math.PI * 2);
                ctx.arc(segment.x + gridSize - 6, segment.y + gridSize - 6, eyeSize, 0, Math.PI * 2);
            }
            ctx.fill();
            
            // Draw pupils
            ctx.fillStyle = 'black';
            const pupilSize = 2;
            ctx.beginPath();
            if (dx > 0) {
                ctx.arc(segment.x + gridSize - 5, segment.y + 6, pupilSize, 0, Math.PI * 2);
                ctx.arc(segment.x + gridSize - 5, segment.y + gridSize - 6, pupilSize, 0, Math.PI * 2);
            } else if (dx < 0) {
                ctx.arc(segment.x + 5, segment.y + 6, pupilSize, 0, Math.PI * 2);
                ctx.arc(segment.x + 5, segment.y + gridSize - 6, pupilSize, 0, Math.PI * 2);
            } else if (dy < 0) {
                ctx.arc(segment.x + 6, segment.y + 5, pupilSize, 0, Math.PI * 2);
                ctx.arc(segment.x + gridSize - 6, segment.y + 5, pupilSize, 0, Math.PI * 2);
            } else {
                ctx.arc(segment.x + 6, segment.y + gridSize - 5, pupilSize, 0, Math.PI * 2);
                ctx.arc(segment.x + gridSize - 6, segment.y + gridSize - 5, pupilSize, 0, Math.PI * 2);
            }
            ctx.fill();
        } else {
            // Draw body segments
            ctx.fillStyle = i % 2 === 0 ? '#4CAF50' : '#45A049'; // Alternating green colors
            ctx.beginPath();
            ctx.arc(segment.x + gridSize/2, segment.y + gridSize/2, (gridSize/2) - 1, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // Draw food (make it look like an apple)
    ctx.fillStyle = '#f44336';
    ctx.beginPath();
    ctx.arc(food.x + gridSize/2, food.y + gridSize/2, gridSize/2 - 1, 0, Math.PI * 2);
    ctx.fill();
    
    // Add a small leaf to the food
    ctx.fillStyle = '#4CAF50';
    ctx.beginPath();
    ctx.ellipse(food.x + gridSize/2 + 2, food.y + 2, 4, 2, Math.PI/4, 0, Math.PI * 2);
    ctx.fill();

    // Draw game over text if game is over
    if (isGameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.font = 'bold 48px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 30);
        
        ctx.font = '24px Arial';
        ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
    }
}

// Handle keyboard input
function handleKeyPress(e) {
    // Always prevent default for arrow keys
    if(["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
    }

    if (!gameStarted) return;
    
    changeDirection(e.key);
}

// New function to handle direction changes
function changeDirection(direction) {
    switch(direction) {
        case 'ArrowUp':
            if (dy === 0) {
                dx = 0;
                dy = -gridSize;
            }
            break;
        case 'ArrowDown':
            if (dy === 0) {
                dx = 0;
                dy = gridSize;
            }
            break;
        case 'ArrowLeft':
            if (dx === 0) {
                dx = -gridSize;
                dy = 0;
            }
            break;
        case 'ArrowRight':
            if (dx === 0) {
                dx = gridSize;
                dy = 0;
            }
            break;
    }
}

// Touch event handlers
function handleTouchStart(e) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
}

function handleTouchMove(e) {
    if (!gameStarted) return;
    
    e.preventDefault();
    
    const touchEndX = e.touches[0].clientX;
    const touchEndY = e.touches[0].clientY;
    
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    
    if (Math.abs(deltaX) > minSwipeDistance || Math.abs(deltaY) > minSwipeDistance) {
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // Horizontal swipe
            changeDirection(deltaX > 0 ? 'ArrowRight' : 'ArrowLeft');
        } else {
            // Vertical swipe
            changeDirection(deltaY > 0 ? 'ArrowDown' : 'ArrowUp');
        }
        touchStartX = touchEndX;
        touchStartY = touchEndY;
    }
}

// Mobile button handlers
function handleMobileButtonClick(direction) {
    if (!gameStarted) return;
    changeDirection(direction);
}

// Add touch event listeners
canvas.addEventListener('touchstart', handleTouchStart, false);
canvas.addEventListener('touchmove', handleTouchMove, false);

// Add mobile button event listeners
upBtn.addEventListener('click', () => handleMobileButtonClick('ArrowUp'));
downBtn.addEventListener('click', () => handleMobileButtonClick('ArrowDown'));
leftBtn.addEventListener('click', () => handleMobileButtonClick('ArrowLeft'));
rightBtn.addEventListener('click', () => handleMobileButtonClick('ArrowRight'));

// Touch events for mobile buttons to prevent double-tap zoom
upBtn.addEventListener('touchend', (e) => {
    e.preventDefault();
    handleMobileButtonClick('ArrowUp');
});
downBtn.addEventListener('touchend', (e) => {
    e.preventDefault();
    handleMobileButtonClick('ArrowDown');
});
leftBtn.addEventListener('touchend', (e) => {
    e.preventDefault();
    handleMobileButtonClick('ArrowLeft');
});
rightBtn.addEventListener('touchend', (e) => {
    e.preventDefault();
    handleMobileButtonClick('ArrowRight');
});

// Game over function
function gameOver() {
    clearInterval(gameLoop);
    gameStarted = false;
    isGameOver = true;
    startButton.style.display = 'none';
    restartButton.style.display = 'inline-block';
    draw();
}

// Start game
function startGame() {
    if (!gameStarted) {
        initGame();
        gameStarted = true;
        gameLoop = setInterval(gameUpdate, 150);
        startButton.style.display = 'none';
        restartButton.style.display = 'none';
    }
}

// Existing event listeners
document.addEventListener('keydown', handleKeyPress);
startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', startGame);

// Initial draw
draw(); 
