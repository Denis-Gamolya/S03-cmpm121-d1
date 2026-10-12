// Vite turns this import into a production-safe URL. Keep it as a file so
// even this tiny example demonstrates a separately deployed asset.
// @deno-types="./asset-url.d.ts"
import tileUrl from "./assets/tile.svg?no-inline";

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
let radius = 300;
const middlePoint = {
  x: document.documentElement.clientWidth / 2,
  y: document.documentElement.clientHeight / 2,
};

const button = document.createElement("button");
const buttonText = document.createTextNode(String(score));
button.style.position = "absolute";
button.appendChild(image);
button.addEventListener("click", () => {
  score++;
  buttonText.textContent = `${score.toFixed(2)}`;
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
  score += deltaTime * 0.1;
  buttonText.textContent = `${score.toFixed(2)}`;
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

const message = document.createElement("p");
message.textContent = "Your project starts here.";

app.append(heading, buttonText, message, timer, button);

function getRandomPosition() {
  const x = ((Math.random() - 0.5) * radius) + middlePoint.x;
  const y = ((Math.random() - 0.5) * radius) + middlePoint.y;
  return { x, y };
}
