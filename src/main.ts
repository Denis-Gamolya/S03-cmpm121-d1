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
let arrowHit = 2; //How many points you get for hitting the target
let lodgeScoreMultiplier = 1; //How fast the score goes up when an arrow is lodged.
let radius = 300; //How far from the center the target can spawn
let arrowCount = 1; //How many arrows can be on the screen at once
let lodgeTime = 1000; //milliseconds

//Upgrade Cost Multipliers
const upgradeStages = {
  "Points per Arrow": 1,
  "Lodged Score Multiplier": 1,
  "Board Radius": 1,
  "Max Arrows": 1,
  "Lodged Time": 1,
};

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

//Score Setup
const scoreText = document.createTextNode(String(score));

//Arrow Click Button
const button = document.createElement("button");
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
/*
  UPGRADE BUTTONS
*/
// Radius Upgrade Button
const upgradeRadiusButton = document.createElement("button");
updateButtonText(
  upgradeRadiusButton,
  "Board Radius",
);
upgradeRadiusButton.addEventListener("click", () => {
  buyUpgrade(upgradeRadiusButton, "Board Radius");
});
upgradeButtons.push(upgradeRadiusButton);

// Arrow Hit Upgrade Button
const upgradeArrowHitButton = document.createElement("button");
updateButtonText(
  upgradeArrowHitButton,
  "Points per Arrow",
);
getCost(upgradeStages["Points per Arrow"]);
upgradeArrowHitButton.addEventListener("click", () => {
  buyUpgrade(upgradeArrowHitButton, "Points per Arrow");
});
upgradeButtons.push(upgradeArrowHitButton);

// Lodge Score Multiplier Upgrade Button
const upgradeLodgeScoreButton = document.createElement("button");
updateButtonText(
  upgradeLodgeScoreButton,
  "Lodged Score Multiplier",
);
getCost(upgradeStages["Lodged Score Multiplier"]);
upgradeLodgeScoreButton.addEventListener("click", () => {
  buyUpgrade(upgradeLodgeScoreButton, "Lodged Score Multiplier");
});
upgradeButtons.push(upgradeLodgeScoreButton);

// Max Arrows Upgrade Button
const upgradeMaxArrowsButton = document.createElement("button");
updateButtonText(
  upgradeMaxArrowsButton,
  "Max Arrows",
);
getCost(upgradeStages["Max Arrows"]);
upgradeMaxArrowsButton.addEventListener("click", () => {
  buyUpgrade(upgradeMaxArrowsButton, "Max Arrows");
});
upgradeButtons.push(upgradeMaxArrowsButton);

// LodgeTime Upgrade Button
const upgradeLodgeTimeButton = document.createElement("button");
updateButtonText(
  upgradeLodgeTimeButton,
  "Lodged Time",
);
getCost(upgradeStages["Lodged Time"]);
upgradeLodgeTimeButton.addEventListener("click", () => {
  buyUpgrade(upgradeLodgeTimeButton, "Lodged Time");
});
upgradeButtons.push(upgradeLodgeTimeButton);

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
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

const message = document.createElement("p");
message.textContent = "Your project starts here.";

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
  updateScore();
}
function updateScore() {
  scoreText.textContent = `${score.toFixed(2)}`;
}
function updateBackdropBounds() {
  const backdropSize = radius * 2 * 1.1;
  backdrop.width = backdropSize;
  backdrop.height = backdropSize;
  backdrop.style.left = `${middlePoint.x - backdropSize / 2}px`;
  backdrop.style.top = `${middlePoint.y - backdropSize / 2}px`;
}
function buyUpgrade(
  HTMLButton: HTMLButtonElement,
  upgradeType: keyof typeof upgradeStages,
) {
  const cost = getCost(upgradeStages[upgradeType]);
  if (score < cost) return;
  score -= cost;
  updateScore();
  switch (upgradeType) {
    case "Points per Arrow":
      arrowHit *= 1.5;
      break;
    case "Lodged Score Multiplier":
      lodgeScoreMultiplier *= 2;
      break;
    case "Board Radius":
      radius *= 0.95;
      updateBackdropBounds();
      break;
    case "Max Arrows":
      arrowCount++;
      break;
    case "Lodged Time":
      lodgeTime += 500;
      break;
  }
  upgradeStages[upgradeType]++;
  updateButtonText(HTMLButton, upgradeType);
}
function updateButtonText(
  Button: HTMLButtonElement,
  upgradeType: keyof typeof upgradeStages,
) {
  Button.textContent = `Upgrade ${upgradeType} - Cost: ${
    getCost(upgradeStages[upgradeType])
  }`;
}
function getCost(stage: number) {
  return (5 ** stage) + 10;
}
app.append(heading, scoreText, message, button, backdrop);
for (const upgradeButton of upgradeButtons) {
  //add a line break before each button
  const lineBreak = document.createElement("br");
  app.append(lineBreak);
  app.append(upgradeButton);
}
