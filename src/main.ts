// Vite turns this import into a production-safe URL. Keep it as a file so
// even this tiny example demonstrates a separately deployed asset.
// @deno-types="./asset-url.d.ts"
import tileUrl from "./assets/tile.svg?no-inline";
import arrowImage from "./assets/arrow.png";
import archeryBackground from "./assets/archery.svg?no-inline";

const app = document.querySelector<HTMLElement>("#app")!;

const heading = document.createElement("h1");
heading.textContent = "Tap Archery";

//Globals
let score = 0;
const middlePoint = {
  x: document.documentElement.clientWidth / 2,
  y: document.documentElement.clientHeight / 2,
};
let arrowsOnScreen = 0;
const upgradeButtons: HTMLButtonElement[] = [];

//Upgrades
let radius = 300; //How far from the center the target can spawn
let arrowCount = 1; //How many arrows can be on the screen at once
let arrowHit = 2; //How many points you get for hitting the target
let lodgeTime = 1000; //milliseconds
let lodgeScoreMultiplier = 1; //How fast the score goes up when an arrow is lodged.

//target Setup
const target = document.createElement("img");
target.src = tileUrl;
target.alt = "A teal tile with a cream circle";
target.width = 96;
target.height = 96;

//Backdrop Setup
const backdrop = document.createElement("img");
backdrop.src = archeryBackground;
backdrop.alt = "A standard archery target";
updateBackdropBounds();
backdrop.style.position = "absolute";
backdrop.style.zIndex = "-1";

//Arrow Click Button
const button = document.createElement("button");
const scoreText = document.createTextNode(String(score));
button.style.position = "absolute";
button.style.backgroundColor = "transparent";
button.style.border = "none";
button.appendChild(target);
button.addEventListener("click", (event) => {
  if (arrowsOnScreen >= arrowCount) return;
  drawArrowAtMouse(event);
  score += arrowHit;
  scoreText.textContent = `${score.toFixed(2)}`;
  const { x, y } = getRandomPosition();
  button.style.left = `${x}px`;
  button.style.top = `${y}px`;
});
//Upgrade Buttons
const upgradeRadiusButton = document.createElement("button");

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

app.append(heading, scoreText, message, timer, button, backdrop);
for (const upgradeButton of upgradeButtons) app.appendChild(upgradeButton);

//HELPER FUNCTIONS
function getRandomPosition() {
  const theta = Math.random() * 2 * Math.PI;
  const x = (Math.cos(theta) * radius) + middlePoint.x - target.width / 2;
  const y = (Math.sin(theta) * radius) + middlePoint.y - target.height / 2;
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
  arrow.inert = true; //Check this later, this may be a problem

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

function updateBackdropBounds() {
  const backdropSize = radius * 2 * 1.1;
  backdrop.width = backdropSize;
  backdrop.height = backdropSize;
  backdrop.style.left = `${middlePoint.x - backdropSize / 2}px`;
  backdrop.style.top = `${middlePoint.y - backdropSize / 2}px`;
}
