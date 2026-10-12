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
const upgradeButtons: UpgradeButton[] = [];

/*
  UPGRADE BUTTONS
*/
// Radius Upgrade Button
interface UpgradeButton extends HTMLButtonElement {
  name: string;
  display: string;
  cost: number;
  stat: number;
  stage: number;
}

const upgradeRadiusButton = Object.assign(
  document.createElement("button") as UpgradeButton,
  {
    name: "radius",
    display: "Board Radius",
    cost: 10,
    stat: 300,
    stage: 1,
  },
);
initializeButton(upgradeRadiusButton);

const upgradeArrowButton = Object.assign(
  document.createElement("button") as UpgradeButton,
  {
    name: "arrowHit",
    display: "Points per Arrow",
    cost: 10,
    stat: 2,
    stage: 1,
  },
);
initializeButton(upgradeArrowButton);

const upgradeMaxArrowButton = Object.assign(
  document.createElement("button") as UpgradeButton,
  {
    name: "maxArrows",
    display: "Max Arrows",
    cost: 10,
    stat: 1,
    stage: 1,
  },
);
initializeButton(upgradeMaxArrowButton);

const upgradeLodgedPointsButton = Object.assign(
  document.createElement("button") as UpgradeButton,
  {
    name: "lodgeScoreMultiplier",
    display: "Lodged Score Multiplier",
    cost: 10,
    stat: 1,
    stage: 1,
  },
);
initializeButton(upgradeLodgedPointsButton);

const upgradeLodgeTimeButton = Object.assign(
  document.createElement("button") as UpgradeButton,
  {
    name: "lodgeTime",
    display: "Lodged Time",
    cost: 10,
    stat: 1000,
    stage: 1,
  },
);
initializeButton(upgradeLodgeTimeButton);

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
const scoreContainer = document.createElement("span");
scoreContainer.className = "game-score";
const scoreText = document.createTextNode(String(score));
scoreContainer.appendChild(scoreText);

//Arrow Click Button
const arrowButton = document.createElement("button");
arrowButton.style.position = "absolute";
arrowButton.style.backgroundColor = "transparent";
arrowButton.style.border = "none";
arrowButton.appendChild(target);
arrowButton.addEventListener("click", (event) => {
  if (arrowsOnScreen >= upgradeMaxArrowButton.stat) return;
  drawArrowAtMouse(event);
  score += upgradeArrowButton.stat;
  updateScore();
  const { x, y } = getRandomPosition();
  arrowButton.style.left = `${x}px`;
  arrowButton.style.top = `${y}px`;
});

// elapsed time
//const timer = document.createTextNode(String(0)); Comented out as it is unused
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

//HELPER FUNCTIONS
function getRandomPosition() {
  const theta = Math.random() * 2 * Math.PI;
  const x = (Math.cos(theta) * upgradeRadiusButton.stat) + middlePoint.x -
    target.width / 2;
  const y = (Math.sin(theta) * upgradeRadiusButton.stat) + middlePoint.y -
    target.height / 2;
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
    arrow.remove();
  }, upgradeLodgeTimeButton.stat);
}

function addPersistentScore(deltaTime: number) {
  if (arrowsOnScreen <= 0) return;
  score += deltaTime * 0.1 * upgradeLodgedPointsButton.stat *
    arrowsOnScreen;
  updateScore();
}
function updateScore() {
  scoreText.textContent = `${score.toFixed(2)}`;
}
function updateBackdropBounds() {
  const backdropSize = upgradeRadiusButton.stat * 2 * 1.1;
  backdrop.width = backdropSize;
  backdrop.height = backdropSize;
  backdrop.style.left = `${middlePoint.x - backdropSize / 2}px`;
  backdrop.style.top = `${middlePoint.y - backdropSize / 2}px`;
}
function buyUpgrade(button: UpgradeButton) {
  if (score < button.cost) return;
  score -= button.cost;
  updateScore();
  switch (button.name) {
    case "arrowHit":
      upgradeArrowButton.stat *= 3;
      break;
    case "lodgeScoreMultiplier":
      upgradeLodgedPointsButton.stat *= 2;
      break;
    case "radius":
      upgradeRadiusButton.stat *= 0.95;
      updateBackdropBounds();
      break;
    case "maxArrows":
      upgradeMaxArrowButton.stat++;
      break;
    case "lodgeTime":
      upgradeLodgeTimeButton.stat += 500;
      break;
  }
  button.stage++;
  setCost(button);
  updateButtonText(button);
}
function initializeButton(button: UpgradeButton) {
  setCost(button);
  updateButtonText(button);
  button.addEventListener("click", () => {
    buyUpgrade(button);
  });
  upgradeButtons.push(button);
}
function updateButtonText(button: UpgradeButton) {
  button.textContent =
    `Upgrade ${button.display} - Cost: ${button.cost} \n Current Level: ${button.stat}`;
}

function setCost(button: UpgradeButton) {
  button.cost = (5 ** button.stage) + 10;
}

app.append(heading, scoreContainer, arrowButton, backdrop);
for (const upgradeButton of upgradeButtons) {
  //add a line break before each button
  const lineBreak = document.createElement("br");
  app.append(lineBreak);
  app.append(upgradeButton);
}
