// Vite turns this import into a production-safe URL. Keep it as a file so
// even this tiny example demonstrates a separately deployed asset.
// @deno-types="./asset-url.d.ts"
import tileUrl from "./assets/tile.svg?no-inline";
import arrowImage from "./assets/arrow.png";

const app = document.querySelector<HTMLElement>("#app")!;

const heading = document.createElement("h1");
heading.textContent = "Tap Archery";

//Image Setup
const image = document.createElement("img");
image.src = tileUrl;
image.alt = "A teal tile with a cream circle";
image.width = 96;
image.height = 96;

//Globals
let score = 0;
const middlePoint = {
  x: document.documentElement.clientWidth / 2,
  y: document.documentElement.clientHeight / 2,
};
let arrowsOnScreen = 0;

//Upgrades
let radius = 300; //How far from the center the target can spawn
let arrowCount = 1; //How many arrows can be on the screen at once
let arrowHit = 2; //How many points you get for hitting the target
let lodgeTime = 1000; //milliseconds
let lodgeScoreMultiplier = 1; //How fast the score goes up when an arrow is lodged.

const button = document.createElement("button");
const scoreText = document.createTextNode(String(score));
button.style.position = "absolute";
button.style.backgroundColor = "transparent";
button.style.border = "none";
button.appendChild(image);
button.addEventListener("click", (event) => {
  if (arrowsOnScreen >= arrowCount) return;
  drawArrowAtMouse(event);
  score += arrowHit;
  scoreText.textContent = `${score.toFixed(2)}`;
  const { x, y } = getRandomPosition();
  button.style.left = `${x}px`;
  button.style.top = `${y}px`;
});

// elapsed time
const timer = document.createTextNode(String(0));
let lastTime = 0;
let totalTime = 0;
function tick(timestamp: number) {
  const currentTime = timestamp / 1000;
  if (lastTime == 0) {
    lastTime = currentTime;
  }
  const deltaTime = currentTime - lastTime;
  lastTime = currentTime;

  totalTime += deltaTime;
  addPersistentScore(deltaTime);
  scoreText.textContent = `${score.toFixed(2)}`;
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

const message = document.createElement("p");
message.textContent = "Your project starts here.";

app.append(heading, scoreText, message, timer, button);

//HELPER FUNCTIONS
function getRandomPosition() {
  const x = ((Math.random() - 0.5) * radius) + middlePoint.x;
  const y = ((Math.random() - 0.5) * radius) + middlePoint.y;
  return { x, y };
}

function drawArrowAtMouse(event: MouseEvent) {
  const x = event.clientX;
  const y = event.clientY;
  spawnArrow(x, y);
}

function spawnArrow(x: number, y: number) {
  const arrow = document.createElement("img");
  arrow.src = arrowImage;
  arrow.style.position = "absolute";

  const arrowPos = { x: x - arrow.width / 2, y: y };
  arrow.style.left = `${arrowPos.x}px`;
  arrow.style.top = `${arrowPos.y}px`;

  startArrowLifecycle(arrow);
  app.appendChild(arrow);
}

function startArrowLifecycle(arrow: HTMLImageElement) {
  arrowsOnScreen++;
  setTimeout(() => {
    arrowsOnScreen--;
    console.log("Arrow removed. Arrows on screen: " + arrowsOnScreen);
    arrow.remove();
  }, lodgeTime);
}

function addPersistentScore(deltaTime: number) {
  if (arrowsOnScreen <= 0) return;
  score += deltaTime * 0.1 * lodgeScoreMultiplier;
}
