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

//Upgrade Cost Multipliers
const upgrades = {
  arrowHit: { display: "Points per Arrow", stage: 1, stat: 2, cost: 10 },
  lodgeScoreMultiplier: {
    display: "Lodged Score Multiplier",
    stage: 1,
    stat: 1,
    cost: 10,
  },
  radius: { display: "Board Radius", stage: 1, stat: 300, cost: 10 },
  arrowCount: { display: "Max Arrows", stage: 1, stat: 1, cost: 10 },
  lodgeTime: { display: "Lodged Time", stage: 1, stat: 1000, cost: 10 },
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
const scoreContainer = document.createElement("span");
scoreContainer.className = "game-score";
const scoreText = document.createTextNode(String(score));
scoreContainer.appendChild(scoreText);

//Arrow Click Button
const button = document.createElement("button");
button.style.position = "absolute";
button.style.backgroundColor = "transparent";
button.style.border = "none";
button.appendChild(target);
button.addEventListener("click", (event) => {
  if (arrowsOnScreen >= upgrades.arrowCount.stat) return;
  drawArrowAtMouse(event);
  score += upgrades.arrowHit.stat;
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
setCost("radius");
updateButtonText(
  upgradeRadiusButton,
  "radius",
);
upgradeRadiusButton.addEventListener("click", () => {
  buyUpgrade(upgradeRadiusButton, "radius");
});
upgradeButtons.push(upgradeRadiusButton);

// Arrow Hit Upgrade Button
const upgradeArrowHitButton = document.createElement("button");
setCost("arrowHit");
updateButtonText(
  upgradeArrowHitButton,
  "arrowHit",
);
upgradeArrowHitButton.addEventListener("click", () => {
  buyUpgrade(upgradeArrowHitButton, "arrowHit");
});
upgradeButtons.push(upgradeArrowHitButton);

// Lodge Score Multiplier Upgrade Button
const upgradeLodgeScoreButton = document.createElement("button");
setCost("lodgeScoreMultiplier");
updateButtonText(
  upgradeLodgeScoreButton,
  "lodgeScoreMultiplier",
);
upgradeLodgeScoreButton.addEventListener("click", () => {
  buyUpgrade(upgradeLodgeScoreButton, "lodgeScoreMultiplier");
});
upgradeButtons.push(upgradeLodgeScoreButton);

// Max Arrows Upgrade Button
const upgradeMaxArrowsButton = document.createElement("button");
setCost("arrowCount");
updateButtonText(
  upgradeMaxArrowsButton,
  "arrowCount",
);
upgradeMaxArrowsButton.addEventListener("click", () => {
  buyUpgrade(upgradeMaxArrowsButton, "arrowCount");
});
upgradeButtons.push(upgradeMaxArrowsButton);

// LodgeTime Upgrade Button
const upgradeLodgeTimeButton = document.createElement("button");
setCost("lodgeTime");
updateButtonText(
  upgradeLodgeTimeButton,
  "lodgeTime",
);
upgradeLodgeTimeButton.addEventListener("click", () => {
  buyUpgrade(upgradeLodgeTimeButton, "lodgeTime");
});
upgradeButtons.push(upgradeLodgeTimeButton);

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
  const x = (Math.cos(theta) * upgrades.radius.stat) + middlePoint.x -
    target.width / 2;
  const y = (Math.sin(theta) * upgrades.radius.stat) + middlePoint.y -
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
  }, upgrades.lodgeTime.stat);
}

function addPersistentScore(deltaTime: number) {
  if (arrowsOnScreen <= 0) return;
  score += deltaTime * 0.1 * upgrades.lodgeScoreMultiplier.stat *
    arrowsOnScreen;
  updateScore();
}
function updateScore() {
  scoreText.textContent = `${score.toFixed(2)}`;
}
function updateBackdropBounds() {
  const backdropSize = upgrades.radius.stat * 2 * 1.1;
  backdrop.width = backdropSize;
  backdrop.height = backdropSize;
  backdrop.style.left = `${middlePoint.x - backdropSize / 2}px`;
  backdrop.style.top = `${middlePoint.y - backdropSize / 2}px`;
}
function buyUpgrade(
  HTMLButton: HTMLButtonElement,
  upgradeType: keyof typeof upgrades,
) {
  if (score < upgrades[upgradeType].cost) return;
  score -= upgrades[upgradeType].cost;
  updateScore();
  switch (upgradeType) {
    case "arrowHit":
      upgrades.arrowHit.stat *= 3;
      break;
    case "lodgeScoreMultiplier":
      upgrades.lodgeScoreMultiplier.stat *= 2;
      break;
    case "radius":
      upgrades.radius.stat *= 0.95;
      updateBackdropBounds();
      break;
    case "arrowCount":
      upgrades.arrowCount.stat++;
      break;
    case "lodgeTime":
      upgrades.lodgeTime.stat += 500;
      break;
  }
  upgrades[upgradeType].stage++;
  setCost(upgradeType);
  console.log(upgrades[upgradeType]);
  updateButtonText(HTMLButton, upgradeType);
}

function updateButtonText(
  Button: HTMLButtonElement,
  upgrade: keyof typeof upgrades,
) {
  Button.textContent = `Upgrade ${upgrades[upgrade].display} - Cost: ${
    upgrades[upgrade].cost
  } \n Current Level: ${upgrades[upgrade].stat}`;
}

function setCost(object: keyof typeof upgrades) {
  upgrades[object].cost = (5 ** upgrades[object].stage) + 10;
}

app.append(heading, scoreContainer, button, backdrop);
for (const upgradeButton of upgradeButtons) {
  //add a line break before each button
  const lineBreak = document.createElement("br");
  app.append(lineBreak);
  app.append(upgradeButton);
}
