const formSection = document.querySelector(".form-section");
const containerEl = document.querySelector(".container");
const emojiLayer = document.getElementById("emojiLayer");
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
const floatingEmojis = [
  "💀", "🧠", "🗣️", "🔥", "💯", "😭", "⚡", "🤯",
  "🚽", "🗿", "👺", "🦍", "🐊", "💅", "🤡", "👁️",
  "🫠", "🥶", "🤖", "👽", "🎃", "🫡", "🐸", "🦧",
];

let emojisRunning = false;
let emojisTimer = null;

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

dobInput.max = new Date().toISOString().split("T")[0];

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
    errorEl.textContent = "Dis-nous en un peu plus sur toi avant de révéler ton brainrot 🧠";
    errorEl.classList.add("visible");
    return;
  }

  const dobDate = new Date(dob + "T00:00:00");
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  if (dobDate > now || dobDate.getFullYear() < 1900) {
    errorEl.textContent = "Cette date de naissance n'a pas l'air très réaliste 🤔";
    errorEl.classList.add("visible");
    return;
  }

  const seed = (firstName + lastName + dob + energy + element).toLowerCase();
  const inputHash = hashString(seed);

  const chosenName = brainrotTerms[inputHash % brainrotTerms.length];

  formSection.classList.add("hidden");
  resultEl.classList.add("visible");

  shuffleNames(brainrotTerms, chosenName, 1500, () => {
    showBrainrotImage(chosenName);
    resultName.classList.add("revealing");
    burstEmojis();

    resultName.addEventListener(
      "animationend",
      () => {
        resultName.classList.remove("revealing");
        startEmojis();
      },
      { once: true },
    );
  });
}

function resetForm() {
  stopEmojis();
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

  emojiLayer.innerHTML = "";
  document.querySelectorAll(".floating-emoji.flying").forEach((e) => e.remove());

  setTimeout(() => {
    formSection.classList.remove("hidden");
  }, 100);
}

function getContainerCenter() {
  const cw = containerEl.offsetWidth;
  const ch = containerEl.offsetHeight;
  return { cx: cw / 2, cy: ch / 2, maxDim: Math.max(cw, ch) };
}

function burstEmojis() {
  const { cx, cy, maxDim } = getContainerCenter();

  for (let i = 0; i < 30; i++) {
    const angle = (Math.PI * 2 * i) / 30 + (Math.random() - 0.5) * 0.4;
    const dist = maxDim * 0.6 + Math.random() * maxDim * 0.5;
    createFloatingEmoji(cx, cy, angle, dist, Math.random() * 0.3, 2 + Math.random() * 1.5);
  }
}

function startEmojis() {
  if (emojisRunning) return;
  emojisRunning = true;
  emojisLoop();
}

function stopEmojis() {
  emojisRunning = false;
  clearTimeout(emojisTimer);
}

function emojisLoop() {
  if (!emojisRunning) return;
  spawnEmoji();
  emojisTimer = setTimeout(emojisLoop, 200 + Math.random() * 400);
}

function spawnEmoji() {
  const { cx, cy, maxDim } = getContainerCenter();
  const angle = Math.random() * Math.PI * 2;
  const dist = maxDim * 0.7 + Math.random() * maxDim * 0.5;

  createFloatingEmoji(cx, cy, angle, dist, 0, 6 + Math.random() * 6);
}

function randomEmoji() {
  if (Math.random() < 0.1) return "6️⃣7️⃣";
  return floatingEmojis[Math.floor(Math.random() * floatingEmojis.length)];
}

function createFloatingEmoji(cx, cy, angle, dist, delay, duration) {
  const emoji = document.createElement("div");
  emoji.className = "floating-emoji";
  emoji.textContent = randomEmoji();
  emoji.style.left = `${cx}px`;
  emoji.style.top = `${cy}px`;
  emoji.style.fontSize = `${1.2 + Math.random() * 1.8}rem`;
  emoji.style.setProperty("--dx", `${Math.cos(angle) * dist}px`);
  emoji.style.setProperty("--dy", `${Math.sin(angle) * dist}px`);
  emoji.style.setProperty("--delay", `${delay}s`);
  emoji.style.setProperty("--duration", `${duration}s`);

  emoji.addEventListener("click", () => {
    if (!resultEl.classList.contains("visible")) return;

    const emojiRect = emoji.getBoundingClientRect();
    const imgRect = resultImg.getBoundingClientRect();
    const targetX = imgRect.left + imgRect.width / 2;
    const targetY = imgRect.top + imgRect.height / 2;

    emoji.style.left = `${emojiRect.left + emojiRect.width / 2}px`;
    emoji.style.top = `${emojiRect.top + emojiRect.height / 2}px`;
    emoji.style.opacity = "1";
    emoji.style.transform = "translate(-50%, -50%)";
    emoji.classList.add("flying");
    document.body.appendChild(emoji);

    // Force reflow so the transition starts from the current position
    void emoji.offsetWidth;
    emoji.style.left = `${targetX}px`;
    emoji.style.top = `${targetY}px`;
    emoji.style.transform = "translate(-50%, -50%) scale(0)";
    emoji.style.opacity = "0";

    setTimeout(() => {
      resultImg.classList.remove("bump");
      void resultImg.offsetWidth;
      resultImg.classList.add("bump");
    }, 250);

    setTimeout(() => emoji.remove(), 450);
  });

  emojiLayer.appendChild(emoji);

  const total = (delay + duration) * 1000;
  setTimeout(() => {
    if (emoji.parentNode) emoji.remove();
  }, total + 500);
}
