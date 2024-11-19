// script.js
const drawingArea = document.getElementById('drawingArea');
const targetAreaDisplay = document.getElementById('targetArea');
const drawnAreaDisplay = document.getElementById('drawnArea');
const accuracyDisplay = document.getElementById('accuracy');
const countdownDisplay = document.getElementById('countdown');
const scoreDisplay = document.getElementById('score');
let score = 0;
let streak = 0;

let startX, startY, rect;
let isDrawingEnabled = true;
const dpi = 96; // typische Bildschirmauflösung in dpi
const cmPerInch = 2.54;
const pixelsPerCm = dpi / cmPerInch;

const windowWidthCm = window.innerWidth / pixelsPerCm;
const windowHeightCm = window.innerHeight / pixelsPerCm;
const maxArea = windowWidthCm * windowHeightCm;

const info = document.getElementById('info');
let offsetX, offsetY;

info.addEventListener('mousedown', startDragging);
document.addEventListener('mouseup', stopDragging);
document.addEventListener('mousemove', drag);

function startDragging(e) {
    offsetX = e.clientX - info.getBoundingClientRect().left;
    offsetY = e.clientY - info.getBoundingClientRect().top;
}

function stopDragging() {
    offsetX = null;
    offsetY = null;
}

function drag(e) {
    if (offsetX !== null && offsetY !== null) {
        const x = e.clientX - offsetX;
        const y = e.clientY - offsetY;
        info.style.left = `${x}px`;
        info.style.top = `${y}px`;
    }
}

function generateRandomArea() {
    const minCm = 5; // Minimum cm²
    return Math.floor(Math.random() * (maxArea - minCm + 1)) + minCm;
}

let targetArea = generateRandomArea(); // Zufällige Ziel-Fläche in cm²
targetAreaDisplay.textContent = targetArea.toFixed(2);

drawingArea.addEventListener('mousedown', startDrawing);
drawingArea.addEventListener('touchstart', (e) => startDrawing(e.touches[0]));

document.addEventListener('mouseup', stopDrawing);
document.addEventListener('touchend', stopDrawing);

function startDrawing(e) {
    if (!isDrawingEnabled) return;

    if (rect) {
        drawingArea.removeChild(rect);
    }

    startX = e.clientX;
    startY = e.clientY;

    rect = document.createElement('div');
    rect.className = 'rectangle';
    rect.style.left = `${startX}px`;
    rect.style.top = `${startY}px`;
    rect.style.backgroundColor = getRandomColor(); // Zufällige Farbe zuweisen
    drawingArea.appendChild(rect);

    drawingArea.addEventListener('mousemove', drawRectangle);
    drawingArea.addEventListener('touchmove', (e) => drawRectangle(e.touches[0]));
}

function stopDrawing() {
    if (!isDrawingEnabled) return;

    drawingArea.removeEventListener('mousemove', drawRectangle);
    drawingArea.removeEventListener('touchmove', (e) => drawRectangle(e.touches[0]));
    calculateAccuracy();
}

function drawRectangle(e) {
    if (!isDrawingEnabled) return;

    const width = e.clientX - startX;
    const height = e.clientY - startY;

    rect.style.width = `${Math.abs(width)}px`;
    rect.style.height = `${Math.abs(height)}px`;
    rect.style.left = `${width < 0 ? e.clientX : startX}px`;
    rect.style.top = `${height < 0 ? e.clientY : startY}px`;
}

function calculateAccuracy() {
    const width = parseInt(rect.style.width, 10);
    const height = parseInt(rect.style.height, 10);
    const drawnAreaPixels = width * height;
    const drawnAreaCm = (drawnAreaPixels / (pixelsPerCm * pixelsPerCm)).toFixed(2);

    drawnAreaDisplay.textContent = drawnAreaCm;
    const accuracy = (Math.min(drawnAreaCm, targetArea) / Math.max(drawnAreaCm, targetArea)) * 100;
    accuracyDisplay.textContent = accuracy.toFixed(2);

    if (accuracy > 90) {
        score++;
        streak++;
        scoreDisplay.textContent = `Score: ${score} (Streak: ${streak})`;
        startCountdown();
    } else {
        streak = 0;
        scoreDisplay.textContent = `Score: ${score} (Streak: ${streak})`;
    }
}

function startCountdown() {
    isDrawingEnabled = false;
    let countdown = 3;
    countdownDisplay.style.display = 'block';
    countdownDisplay.textContent = countdown;

    const interval = setInterval(() => {
        countdown--;
        if (countdown > 0) {
            countdownDisplay.textContent = countdown;
        } else {
            clearInterval(interval);
            countdownDisplay.style.display = 'none';
            if (rect) {
                rect.classList.add('fade-out');
                setTimeout(() => {
                    if (rect) {
                        drawingArea.removeChild(rect);
                        rect = null;
                    }
                }, 1000); // Match the transition duration
            }
            targetArea = generateRandomArea();
            targetAreaDisplay.textContent = targetArea.toFixed(2);
            isDrawingEnabled = true;
        }
    }, 1000);
}

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
