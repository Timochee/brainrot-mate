/* engine.js — shared logic for config-driven apps */
(function () {
  "use strict";

  const C = window.APP_CONFIG;
  const D = window.APP_DATA;

  /* ---- DOM refs ---- */
  const formSection = document.querySelector(".form-section");
  const containerEl = document.querySelector(".container");
  const emojiLayer = document.getElementById("emojiLayer");
  const resultEl = document.getElementById("result");
  const resultIntro = document.getElementById("resultIntro");
  const resultName = document.getElementById("resultName");
  const resultImg = document.getElementById("resultImg");
  const errorEl = document.getElementById("error");
  const firstNameInput = document.getElementById("prenom");
  const lastNameInput = document.getElementById("nom");
  const dobInput = document.getElementById("dob");
  const btnMain = document.getElementById("btnMain");
  const btnRetry = document.getElementById("btnRetry");
  const pillGroupsContainer = document.getElementById("pillGroupsContainer");
  const resultActions = document.getElementById("resultActions");

  let emojisRunning = false;
  let emojisTimer = null;
  const pillGroupState = {}; // { groupId: { pills: NodeList, hidden: HTMLInputElement } }

  /* ---- Theme ---- */
  function applyTheme() {
    const t = C.theme;
    const s = document.documentElement.style;
    s.setProperty("--gradient-start", t.gradientStart);
    s.setProperty("--gradient-mid", t.gradientMid);
    s.setProperty("--gradient-end", t.gradientEnd);
    s.setProperty("--accent", t.accent);
    s.setProperty("--accent-dark", t.accentDark);
    s.setProperty("--hover-bg", t.hoverBg);
    s.setProperty("--error-color", t.errorColor);
    s.setProperty("--btn-shadow", t.btnShadow);
    s.setProperty("--dark-gradient-start", t.darkGradientStart);
    s.setProperty("--dark-gradient-mid", t.darkGradientMid);
    s.setProperty("--dark-gradient-end", t.darkGradientEnd);
    s.setProperty("--dark-container-bg", t.darkContainerBg);
    s.setProperty("--dark-input-bg", t.darkInputBg);
    s.setProperty("--dark-input-border", t.darkInputBorder);
    s.setProperty("--dark-pill-hover-bg", t.darkPillHoverBg);
    s.setProperty("--dark-error-color", t.darkErrorColor);
  }

  /* ---- Text ---- */
  function populateText() {
    const t = C.text;
    document.querySelector("h1").textContent = t.heading;
    btnMain.textContent = t.submitBtn;
    errorEl.textContent = t.errorMissing;
    resultIntro.textContent = t.resultIntro;
    btnRetry.textContent = t.retryBtn;
  }

  /* ---- Pill groups ---- */
  function buildPillGroups() {
    pillGroupsContainer.innerHTML = "";
    C.pillGroups.forEach(function (group) {
      const wrapper = document.createElement("div");
      wrapper.className = "form-group";

      const lbl = document.createElement("label");
      lbl.textContent = group.label;
      wrapper.appendChild(lbl);

      const pillsDiv = document.createElement("div");
      pillsDiv.className = "pills";
      pillsDiv.id = group.id + "Pills";
      pillsDiv.setAttribute("role", "group");
      pillsDiv.setAttribute("aria-label", group.ariaLabel);

      group.options.forEach(function (opt) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "pill";
        btn.dataset.value = opt.value;
        btn.setAttribute("aria-pressed", "false");
        btn.textContent = opt.label;
        pillsDiv.appendChild(btn);
      });

      wrapper.appendChild(pillsDiv);

      const hidden = document.createElement("input");
      hidden.type = "hidden";
      hidden.id = group.id;
      wrapper.appendChild(hidden);

      pillGroupsContainer.appendChild(wrapper);

      const pills = pillsDiv.querySelectorAll(".pill");
      setupPillGroup(pills, hidden);
      pillGroupState[group.id] = { pills: pills, hidden: hidden };
    });
  }

  function resetPillGroup(pills) {
    pills.forEach(function (p) {
      p.classList.remove("active");
      p.setAttribute("aria-pressed", "false");
    });
  }

  function setupPillGroup(pills, hiddenInput) {
    pills.forEach(function (pill) {
      pill.addEventListener("click", function () {
        resetPillGroup(pills);
        pill.classList.add("active");
        pill.setAttribute("aria-pressed", "true");
        hiddenInput.value = pill.dataset.value;
      });
    });
  }

  /* ---- Share ---- */
  function buildShareButton() {
    if (!C.text.shareBtn) return;
    const btn = document.createElement("button");
    btn.className = "btn-share";
    btn.id = "btnShare";
    btn.textContent = C.text.shareBtn;
    resultActions.appendChild(btn);

    btn.addEventListener("click", function () {
      var name = resultName.textContent;
      var text = C.text.shareText.replace("{name}", name);
      var url = window.location.href;

      var resetBtn = function () {
        setTimeout(function () {
          btn.textContent = C.text.shareBtn;
          btn.classList.remove("copied");
        }, 2000);
      };

      if (navigator.share) {
        navigator.share({ title: C.text.shareTitle, text: text, url: url }).catch(function () {});
      } else {
        navigator.clipboard
          .writeText(text + " " + url)
          .then(function () {
            btn.textContent = "Copié ✓";
            btn.classList.add("copied");
            resetBtn();
          })
          .catch(function () {});
      }
    });
  }

  /* ---- Result image ---- */
  function showResultImage(name) {
    if (!C.result.showImage) return;
    var imageMap = D.imageMap;
    if (!imageMap) return;
    var file = imageMap[name];
    if (!file) return;
    resultImg.src = C.result.imagePath + file;
    resultImg.alt = name;
    resultImg.classList.remove("visible");
    resultImg.onload = function () { resultImg.classList.add("visible"); };
    resultImg.onerror = function () { resultImg.classList.remove("visible"); };
  }

  /* ---- Hash ---- */
  function hashString(str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  /* ---- Fit name ---- */
  function fitNameSize() {
    var container = resultName.parentElement;
    var maxWidth = container.offsetWidth * 0.95;
    var size = parseFloat(getComputedStyle(resultName).fontSize);
    while (resultName.scrollWidth > maxWidth && size > 16) {
      size -= 1;
      resultName.style.fontSize = size + "px";
    }
  }

  /* ---- Shuffle ---- */
  function shuffleNames(pool, finalName, duration, callback) {
    var interval = 70;
    var steps = Math.floor(duration / interval);
    var step = 0;

    var maxLen = Math.max(finalName.length, 8);
    var shortPool = pool.filter(function (p) { return p.length <= maxLen; });
    var shufflePool = shortPool.length >= 5 ? shortPool : pool;

    var longest = shufflePool.reduce(function (a, b) { return a.length > b.length ? a : b; });
    resultName.style.fontSize = "";
    resultName.textContent = longest;
    var defaultHeight = resultName.offsetHeight;
    fitNameSize();
    resultName.style.minHeight = defaultHeight + "px";
    resultName.classList.add("shuffling");

    var timer = setInterval(function () {
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

  /* ---- Discover ---- */
  function getFormValues() {
    var values = {
      firstName: firstNameInput.value.trim(),
      lastName: lastNameInput.value.trim(),
      dob: dobInput.value,
    };
    C.pillGroups.forEach(function (group) {
      values[group.id] = pillGroupState[group.id].hidden.value;
    });
    return values;
  }

  function discover() {
    var fv = getFormValues();
    errorEl.classList.remove("visible");

    // Validate required fields
    var missing = !fv.firstName || !fv.lastName || !fv.dob;
    C.pillGroups.forEach(function (group) {
      if (!fv[group.id]) missing = true;
    });
    if (missing) {
      errorEl.textContent = C.text.errorMissing;
      errorEl.classList.add("visible");
      return;
    }

    // Date validation
    if (C.features.dateValidation) {
      var dobDate = new Date(fv.dob + "T00:00:00");
      var now = new Date();
      now.setHours(0, 0, 0, 0);
      if (dobDate > now || dobDate.getFullYear() < 1900) {
        errorEl.textContent = C.text.errorDate;
        errorEl.classList.add("visible");
        return;
      }
    }

    var seed = C.getSeed(fv);
    var inputHash = hashString(seed);
    var pool = C.getPool(D, fv);
    var result = C.getResult(D, inputHash, pool);

    formSection.classList.add("hidden");
    resultEl.classList.add("visible");

    shuffleNames(pool, result.name, 1500, function () {
      showResultImage(result.name);
      resultName.classList.add("revealing");
      burstEmojis();

      resultName.addEventListener(
        "animationend",
        function () {
          resultName.classList.remove("revealing");
          startEmojis();
          btnRetry.focus();
        },
        { once: true }
      );
    });
  }

  /* ---- Reset ---- */
  function resetForm() {
    stopEmojis();
    resultEl.classList.remove("visible");
    resultName.classList.remove("revealing", "shuffling", "bump");
    resultImg.classList.remove("visible", "bump");
    resultImg.src = "";

    firstNameInput.value = "";
    lastNameInput.value = "";
    dobInput.value = "";

    Object.keys(pillGroupState).forEach(function (id) {
      var g = pillGroupState[id];
      g.hidden.value = "";
      resetPillGroup(g.pills);
    });

    emojiLayer.innerHTML = "";
    document.querySelectorAll(".floating-emoji.flying").forEach(function (e) { e.remove(); });

    setTimeout(function () {
      formSection.classList.remove("hidden");
      firstNameInput.focus();
    }, 100);
  }

  /* ---- Emoji system ---- */
  function getContainerCenter() {
    var cw = containerEl.offsetWidth;
    var ch = containerEl.offsetHeight;
    return { cx: cw / 2, cy: ch / 2, maxDim: Math.max(cw, ch) };
  }

  function burstEmojis() {
    var c = getContainerCenter();
    for (var i = 0; i < 30; i++) {
      var angle = (Math.PI * 2 * i) / 30 + (Math.random() - 0.5) * 0.4;
      var dist = c.maxDim * 0.6 + Math.random() * c.maxDim * 0.5;
      createFloatingEmoji(c.cx, c.cy, angle, dist, Math.random() * 0.3, 2 + Math.random() * 1.5);
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
    var min = C.emojis.spawnMin;
    var max = C.emojis.spawnMax;
    emojisTimer = setTimeout(emojisLoop, min + Math.random() * (max - min));
  }

  function spawnEmoji() {
    var c = getContainerCenter();
    var angle = Math.random() * Math.PI * 2;
    var dist = c.maxDim * 0.7 + Math.random() * c.maxDim * 0.5;
    createFloatingEmoji(c.cx, c.cy, angle, dist, 0, 6 + Math.random() * 6);
  }

  function randomEmoji() {
    if (C.emojis.randomFn) return C.emojis.randomFn(C.emojis.set);
    return C.emojis.set[Math.floor(Math.random() * C.emojis.set.length)];
  }

  function createFloatingEmoji(cx, cy, angle, dist, delay, duration) {
    var emoji = document.createElement("div");
    emoji.className = "floating-emoji";
    emoji.textContent = randomEmoji();
    emoji.style.left = cx + "px";
    emoji.style.top = cy + "px";
    emoji.style.fontSize = (1.2 + Math.random() * 1.8) + "rem";
    emoji.style.setProperty("--dx", Math.cos(angle) * dist + "px");
    emoji.style.setProperty("--dy", Math.sin(angle) * dist + "px");
    emoji.style.setProperty("--delay", delay + "s");
    emoji.style.setProperty("--duration", duration + "s");

    emoji.addEventListener("click", function () {
      if (!resultEl.classList.contains("visible")) return;

      var bumpTarget = C.result.bumpTarget === "image" ? resultImg : resultName;
      var emojiRect = emoji.getBoundingClientRect();
      var targetRect = bumpTarget.getBoundingClientRect();
      var targetX = targetRect.left + targetRect.width / 2;
      var targetY = targetRect.top + targetRect.height / 2;

      emoji.style.left = (emojiRect.left + emojiRect.width / 2) + "px";
      emoji.style.top = (emojiRect.top + emojiRect.height / 2) + "px";
      emoji.style.opacity = "1";
      emoji.style.transform = "translate(-50%, -50%)";
      emoji.classList.add("flying");
      document.body.appendChild(emoji);

      void emoji.offsetWidth;
      emoji.style.left = targetX + "px";
      emoji.style.top = targetY + "px";
      emoji.style.transform = "translate(-50%, -50%) scale(0)";
      emoji.style.opacity = "0";

      setTimeout(function () {
        bumpTarget.classList.remove("bump");
        void bumpTarget.offsetWidth;
        bumpTarget.classList.add("bump");
      }, 250);

      setTimeout(function () { emoji.remove(); }, 450);
    });

    emojiLayer.appendChild(emoji);

    var total = (delay + duration) * 1000;
    setTimeout(function () {
      if (emoji.parentNode) emoji.remove();
    }, total + 500);
  }

  /* ---- Meta ---- */
  function applyMeta() {
    var m = C.meta;
    if (!m) return;
    if (m.title) document.title = m.title;
    if (m.description) {
      setMetaContent("description", m.description);
      setMetaProperty("og:description", m.description);
    }
    if (m.ogTitle) setMetaProperty("og:title", m.ogTitle);
    if (m.ogImage) setMetaProperty("og:image", m.ogImage);
    if (m.themeColor) setMetaContent("theme-color", m.themeColor);
    if (m.favicon) document.querySelector('link[rel="icon"]').href = m.favicon;
    if (m.manifest) {
      var link = document.createElement("link");
      link.rel = "manifest";
      link.href = m.manifest;
      document.head.appendChild(link);
    }
  }

  function setMetaContent(name, content) {
    var el = document.querySelector('meta[name="' + name + '"]');
    if (el) el.content = content;
  }

  function setMetaProperty(prop, content) {
    var el = document.querySelector('meta[property="' + prop + '"]');
    if (el) el.content = content;
  }

  /* ---- Features ---- */
  function initFeatures() {
    if (C.features.pwa && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("./sw.js").catch(function () {});
    }

    if (C.features.analytics && C.features.analytics.goatcounter) {
      var s = document.createElement("script");
      s.dataset.goatcounter = C.features.analytics.goatcounter;
      s.async = true;
      s.src = "//gc.zgo.at/count.js";
      document.body.appendChild(s);
    }

    if (C.features.dateValidation) {
      var today = new Date();
      dobInput.max =
        today.getFullYear() +
        "-" +
        String(today.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(today.getDate()).padStart(2, "0");
    }

    if (C.features.staggerFormAnimation) {
      formSection.classList.add("stagger");
    }

    if (C.result.userSelectNone) {
      resultEl.classList.add("no-select");
    }
  }

  /* ---- Init ---- */
  function init() {
    applyTheme();
    applyMeta();
    populateText();
    buildPillGroups();
    buildShareButton();
    initFeatures();

    btnMain.addEventListener("click", discover);
    btnRetry.addEventListener("click", resetForm);

    document.querySelectorAll("input").forEach(function (el) {
      el.addEventListener("keydown", function (e) {
        if (e.key === "Enter") discover();
      });
    });
  }

  init();
})();
