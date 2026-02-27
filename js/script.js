const formSection = document.querySelector(".form-section");
const containerEl = document.querySelector(".container");
const heartsLayer = document.getElementById("heartsLayer");
const resultEl = document.getElementById("result");
const resultName = document.getElementById("resultName");
const errorEl = document.getElementById("error");
const firstNameInput = document.getElementById("prenom");
const lastNameInput = document.getElementById("nom");
const dobInput = document.getElementById("dob");
const energyInput = document.getElementById("energy");
const elementInput = document.getElementById("element");
const energyPills = document.querySelectorAll('#energyPills .pill');
const elementPills = document.querySelectorAll('#elementPills .pill');
const resultImg = document.getElementById("resultImg");
const btnMain = document.getElementById("btnMain");
const btnRetry = document.getElementById("btnRetry");
const brainrotEmojis = ["💀", "🧠", "🗣️", "🔥", "💯", "😭", "⚡", "🤯"];

let heartsRunning = false;
let heartsTimer = null;

function setupPillGroup(pills, hiddenInput) {
  pills.forEach((pill) => {
    pill.addEventListener("click", () => {
      pills.forEach((p) => p.classList.remove("active"));
      pill.classList.add("active");
      hiddenInput.value = pill.dataset.value;
    });
  });
}

setupPillGroup(energyPills, energyInput);
setupPillGroup(elementPills, elementInput);

btnMain.addEventListener("click", discover);
btnRetry.addEventListener("click", resetForm);

document.querySelectorAll("input").forEach((el) => {
  el.addEventListener("keydown", (e) => {
    if (e.key === "Enter") discover();
  });
});

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function showBrainrotImage(name) {
  const file = brainrotImageMap[name];
  if (!file) return;
  resultImg.src = "assets/images/" + file;
  resultImg.alt = name;
  resultImg.classList.remove("visible");
  resultImg.onload = () => resultImg.classList.add("visible");
  resultImg.onerror = () => resultImg.classList.remove("visible");
}

function fitNameSize() {
  const container = resultName.parentElement;
  const maxWidth = container.offsetWidth * 0.95;
  let size = parseFloat(getComputedStyle(resultName).fontSize);
  while (resultName.scrollWidth > maxWidth && size > 16) {
    size -= 1;
    resultName.style.fontSize = size + "px";
  }
}

function shuffleNames(pool, finalName, duration, callback) {
  const interval = 70;
  const steps = Math.floor(duration / interval);
  let step = 0;

  const maxLen = Math.max(finalName.length, 8);
  const shortPool = pool.filter((p) => p.length <= maxLen);
  const shufflePool = shortPool.length >= 5 ? shortPool : pool;

  const longest = shufflePool.reduce((a, b) => a.length > b.length ? a : b);
  resultName.style.fontSize = "";
  resultName.textContent = longest;
  const defaultHeight = resultName.offsetHeight;
  fitNameSize();
  resultName.style.minHeight = defaultHeight + "px";
  resultName.classList.add("shuffling");

  const timer = setInterval(() => {
    resultName.textContent = shufflePool[Math.floor(Math.random() * shufflePool.length)];
    step++;
    if (step >= steps) {
      clearInterval(timer);
      resultName.classList.remove("shuffling");
      resultName.style.minHeight = "";
      resultName.textContent = finalName;
      resultName.style.fontSize = "";
      fitNameSize();
      callback();
    }
  }, interval);
}

function discover() {
  const firstName = firstNameInput.value.trim();
  const lastName = lastNameInput.value.trim();
  const dob = dobInput.value;
  const energy = energyInput.value;
  const element = elementInput.value;

  errorEl.classList.remove("visible");

  if (!firstName || !lastName || !dob || !energy || !element) {
    errorEl.classList.add("visible");
    return;
  }

  const seed = (firstName + lastName + dob + energy + element).toLowerCase();
  const inputHash = hashString(seed);

  const chosenName = brainrotTerms[inputHash % brainrotTerms.length];

  resultName.textContent = brainrotTerms[Math.floor(Math.random() * brainrotTerms.length)];

  formSection.classList.add("hidden");
  resultEl.classList.add("visible");

  shuffleNames(brainrotTerms, chosenName, 1500, () => {
    showBrainrotImage(chosenName);
    resultName.classList.add("revealing");
    burstHearts();

    resultName.addEventListener(
      "animationend",
      () => {
        resultName.classList.remove("revealing");
        startHearts();
      },
      { once: true },
    );
  });
}

function resetForm() {
  stopHearts();
  resultEl.classList.remove("visible");
  resultName.classList.remove("revealing", "shuffling");
  resultImg.classList.remove("visible", "bump");
  resultImg.src = "";

  firstNameInput.value = "";
  lastNameInput.value = "";
  dobInput.value = "";
  energyInput.value = "";
  elementInput.value = "";
  energyPills.forEach((p) => p.classList.remove("active"));
  elementPills.forEach((p) => p.classList.remove("active"));

  heartsLayer.innerHTML = "";
  document.querySelectorAll(".card-heart.flying").forEach((h) => h.remove());

  setTimeout(() => {
    formSection.classList.remove("hidden");
  }, 100);
}

function getContainerCenter() {
  const cw = containerEl.offsetWidth;
  const ch = containerEl.offsetHeight;
  return { cx: cw / 2, cy: ch / 2, maxDim: Math.max(cw, ch) };
}

function burstHearts() {
  const { cx, cy, maxDim } = getContainerCenter();

  for (let i = 0; i < 30; i++) {
    const angle = (Math.PI * 2 * i) / 30 + (Math.random() - 0.5) * 0.4;
    const dist = maxDim * 0.6 + Math.random() * maxDim * 0.5;
    createHeart(cx, cy, angle, dist, Math.random() * 0.3, 2 + Math.random() * 1.5);
  }
}

function startHearts() {
  if (heartsRunning) return;
  heartsRunning = true;
  heartsLoop();
}

function stopHearts() {
  heartsRunning = false;
  clearTimeout(heartsTimer);
}

function heartsLoop() {
  if (!heartsRunning) return;
  spawnHeart();
  heartsTimer = setTimeout(heartsLoop, 400 + Math.random() * 800);
}

function spawnHeart() {
  const { cx, cy, maxDim } = getContainerCenter();
  const angle = Math.random() * Math.PI * 2;
  const dist = maxDim * 0.7 + Math.random() * maxDim * 0.5;

  createHeart(cx, cy, angle, dist, 0, 6 + Math.random() * 6);
}

function createHeart(cx, cy, angle, dist, delay, duration) {
  const heart = document.createElement("div");
  heart.className = "card-heart";
  heart.textContent =
    brainrotEmojis[Math.floor(Math.random() * brainrotEmojis.length)];
  heart.style.left = `${cx}px`;
  heart.style.top = `${cy}px`;
  heart.style.fontSize = `${1.2 + Math.random() * 1.8}rem`;
  heart.style.setProperty("--dx", `${Math.cos(angle) * dist}px`);
  heart.style.setProperty("--dy", `${Math.sin(angle) * dist}px`);
  heart.style.setProperty("--delay", `${delay}s`);
  heart.style.setProperty("--duration", `${duration}s`);

  heart.addEventListener("click", () => {
    if (!resultEl.classList.contains("visible")) return;

    const heartRect = heart.getBoundingClientRect();
    const imgRect = resultImg.getBoundingClientRect();
    const targetX = imgRect.left + imgRect.width / 2;
    const targetY = imgRect.top + imgRect.height / 2;

    heart.style.left = `${heartRect.left + heartRect.width / 2}px`;
    heart.style.top = `${heartRect.top + heartRect.height / 2}px`;
    heart.style.opacity = "1";
    heart.style.transform = "translate(-50%, -50%)";
    heart.classList.add("flying");
    document.body.appendChild(heart);

    // Force reflow so the transition starts from the current position
    void heart.offsetWidth;
    heart.style.left = `${targetX}px`;
    heart.style.top = `${targetY}px`;
    heart.style.transform = "translate(-50%, -50%) scale(0)";
    heart.style.opacity = "0";

    setTimeout(() => {
      resultImg.classList.remove("bump");
      void resultImg.offsetWidth;
      resultImg.classList.add("bump");
    }, 250);

    setTimeout(() => heart.remove(), 450);
  });

  heartsLayer.appendChild(heart);

  const total = (delay + duration) * 1000;
  setTimeout(() => {
    if (heart.parentNode) heart.remove();
  }, total + 500);
}
