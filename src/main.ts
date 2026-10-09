// Vite turns this import into a production-safe URL. Keep it as a file so
// even this tiny example demonstrates a separately deployed asset.
// @deno-types="./asset-url.d.ts"
import tileUrl from "./assets/tile.svg?no-inline";

const app = document.querySelector<HTMLElement>("#app")!;

const heading = document.createElement("h1");
heading.textContent = "D1 project";

const image = document.createElement("img");
image.src = tileUrl;
image.alt = "A teal tile with a cream circle";
image.width = 96;
image.height = 96;

let counter = 0;
const button = document.createElement("button");
const buttonText = document.createTextNode(String(counter));
button.style.position = "absolute";
button.appendChild(image);
button.appendChild(buttonText);
button.addEventListener("click", () => {
  counter++;
  buttonText.textContent = `${counter.toFixed(2)}`;
  const x = Math.random() * document.body.clientWidth;
  const y = Math.random() * document.body.clientHeight;
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
  counter += deltaTime * 0.1;
  buttonText.textContent = `${counter.toFixed(2)}`;
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

const message = document.createElement("p");
message.textContent = "Your project starts here.";

app.append(heading, message, timer, button);
