const KEY = "survey-showdown-v1";
const SETTINGS_KEY = "survey-showdown-settings";
const SCORES_KEY = "survey-showdown-scores";

const SAMPLES = [
  {
    id: "sample-sleep",
    question: "Name something people do when they cannot sleep",
    answers: [
      ["Count sheep", 28], ["Watch TV", 22], ["Read a book", 15], ["Warm milk", 12],
      ["Scroll a phone", 9], ["Listen to music", 6], ["Worry", 5], ["Get a snack", 3],
    ],
  },
  {
    id: "sample-sick",
    question: "Name a reason people call in sick",
    answers: [
      ["Actually sick", 35], ["Need a day off", 18], ["Kids are home", 14], ["Doctor visit", 12],
      ["Too tired", 8], ["Bad weather", 6], ["Overslept", 4], ["Car trouble", 3],
    ],
  },
  {
    id: "sample-drawer",
    question: "Name something you find in a kitchen drawer",
    answers: [
      ["Utensils", 32], ["Junk mail", 20], ["Batteries", 14], ["Rubber bands", 10],
      ["Tape", 8], ["Scissors", 7], ["Takeout menus", 5], ["Matches", 4],
    ],
  },
].map(pack);

function pack(row) {
  return {
    id: row.id,
    question: row.question,
    answers: row.answers.map(([text, points]) => ({ text, points })),
  };
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function loadSurveys() {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (!Array.isArray(parsed) || !parsed.length) return SAMPLES;
    return parsed;
  } catch {
    return SAMPLES;
  }
}

function saveSurveys(list) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

function loadSettings() {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
  } catch {
    return {};
  }
}

function normalize(input) {
  const answers = (input.answers || [])
    .map((a) => ({ text: String(a.text || "").trim(), points: Math.max(0, Math.round(Number(a.points) || 0)) }))
    .filter((a) => a.text)
    .sort((a, b) => b.points - a.points)
    .slice(0, 8);
  return { id: input.id || uid(), question: String(input.question || "").trim(), answers };
}

const audioBag = { ctx: null, muted: false };

function audio() {
  if (!audioBag.ctx) audioBag.ctx = new AudioContext();
  if (audioBag.ctx.state === "suspended") audioBag.ctx.resume();
  return audioBag.ctx;
}

function tone(freq, duration, type, gainValue, when = 0) {
  if (audioBag.muted) return;
  const a = audio();
  const osc = a.createOscillator();
  const gain = a.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const t = a.currentTime + when;
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(gainValue, t + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  osc.connect(gain);
  gain.connect(a.destination);
  osc.start(t);
  osc.stop(t + duration + 0.02);
}

const sounds = {
  reveal() { tone(880, 0.16, "sine", 0.28); tone(1175, 0.32, "sine", 0.22, 0.06); },
  strike() { tone(110, 0.42, "sawtooth", 0.22); tone(78, 0.4, "square", 0.12); },
  points() { [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.26, "triangle", 0.22, i * 0.07)); },
  next() { tone(320, 0.14, "sine", 0.12); },
  toggle() { audioBag.muted = !audioBag.muted; return audioBag.muted; },
};

function nav(active) {
  document.querySelectorAll("[data-nav]").forEach((el) => {
    if (el.getAttribute("data-nav") === active) el.classList.add("active");
  });
}

function bootAdmin() {
  nav("admin");
  let surveys = loadSurveys();
  const settings = loadSettings();
  const question = document.querySelector("#question");
  const note = document.querySelector("#note");
  const list = document.querySelector("#list");
  const url = document.querySelector("#url");
  const key = document.querySelector("#key");
  const editing = { id: "" };
  url.value = settings.url || "";
  key.value = settings.anonKey || "";

  const inputs = [...document.querySelectorAll("[data-answer]")];
  const points = [...document.querySelectorAll("[data-points]")];

  function clearForm() {
    editing.id = "";
    question.value = "";
    inputs.forEach((el) => { el.value = ""; });
    points.forEach((el) => { el.value = ""; });
  }

  function render() {
    list.innerHTML = surveys.map((s) => `
      <article class="q">
        <strong>${escapeHtml(s.question)}</strong>
        <p>${escapeHtml(s.answers.map((a) => `${a.text} (${a.points})`).join(" · "))}</p>
        <div class="actions">
          <button type="button" data-edit="${s.id}">Edit</button>
          <button type="button" class="red" data-del="${s.id}">Delete</button>
        </div>
      </article>`).join("") || "<p>No questions yet.</p>";
  }

  document.querySelector("#form").addEventListener("submit", (e) => {
    e.preventDefault();
    const clean = normalize({
      id: editing.id,
      question: question.value,
      answers: inputs.map((el, i) => ({ text: el.value, points: points[i].value })),
    });
    if (!clean.question || !clean.answers.length) {
      note.textContent = "Add a question and at least one answer.";
      return;
    }
    surveys = surveys.some((s) => s.id === clean.id)
      ? surveys.map((s) => (s.id === clean.id ? clean : s))
      : [...surveys, clean];
    saveSurveys(surveys);
    clearForm();
    render();
    note.textContent = "Saved in this browser.";
  });

  list.addEventListener("click", (e) => {
    const edit = e.target.closest("[data-edit]");
    const del = e.target.closest("[data-del]");
    if (edit) {
      const found = surveys.find((s) => s.id === edit.dataset.edit);
      if (!found) return;
      editing.id = found.id;
      question.value = found.question;
      inputs.forEach((el, i) => { el.value = found.answers[i]?.text || ""; });
      points.forEach((el, i) => { el.value = found.answers[i]?.points || ""; });
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    if (del) {
      surveys = surveys.filter((s) => s.id !== del.dataset.del);
      saveSurveys(surveys);
      render();
    }
  });

  document.querySelector("#upload").addEventListener("click", async () => {
    const cloud = { url: url.value.trim(), anonKey: key.value.trim() };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(cloud));
    if (!cloud.url || !cloud.anonKey) return (note.textContent = "Add a Supabase URL and anon key.");
    const res = await fetch(cloud.url.replace(/\/+$/, "") + "/rest/v1/surveys", {
      method: "POST",
      headers: {
        apikey: cloud.anonKey,
        Authorization: "Bearer " + cloud.anonKey,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify(surveys),
    });
    note.textContent = res.ok ? "Uploaded to Supabase." : "Upload failed (" + res.status + ")";
  });

  document.querySelector("#download").addEventListener("click", async () => {
    const cloud = { url: url.value.trim(), anonKey: key.value.trim() };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(cloud));
    if (!cloud.url || !cloud.anonKey) return (note.textContent = "Add a Supabase URL and anon key.");
    const res = await fetch(cloud.url.replace(/\/+$/, "") + "/rest/v1/surveys?select=id,question,answers", {
      headers: { apikey: cloud.anonKey, Authorization: "Bearer " + cloud.anonKey },
    });
    if (!res.ok) return (note.textContent = "Download failed (" + res.status + ")");
    const rows = await res.json();
    surveys = rows.map(normalize).filter((s) => s.question);
    saveSurveys(surveys);
    render();
    note.textContent = "Loaded " + surveys.length + " surveys.";
  });

  document.querySelector("#export").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(surveys, null, 2)], { type: "application/json" });
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = "surveys.json";
    a.click();
    URL.revokeObjectURL(href);
  });

  document.querySelector("#import").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      surveys = JSON.parse(String(reader.result)).map(normalize).filter((s) => s.question);
      saveSurveys(surveys);
      render();
      note.textContent = "Imported " + surveys.length + " surveys.";
    };
    reader.readAsText(file);
  });

  render();
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (ch) => {
    const code = ch.charCodeAt(0);
    if (code === 38) return "&" + "amp;";
    if (code === 60) return "&" + "lt;";
    if (code === 62) return "&" + "gt;";
    if (code === 34) return "&" + "quot;";
    return "&" + "#39;";
  });
}

function bootBoard() {
  nav("board");
  const surveys = loadSurveys();
  let index = 0;
  let open = new Set();
  let strikes = 0;
  let scores = JSON.parse(localStorage.getItem(SCORES_KEY) || "null") || {
    leftName: "TEAM A", rightName: "TEAM B", leftScore: 0, rightScore: 0,
  };
  const question = document.querySelector("#question");
  const slots = document.querySelector("#slots");
  const count = document.querySelector("#count");
  const strikeEls = [...document.querySelectorAll("[data-strike]")];
  const bigx = document.querySelector("#bigx");
  const flash = document.querySelector("#flash");
  const leftName = document.querySelector("#left-name");
  const rightName = document.querySelector("#right-name");
  const leftScore = document.querySelector("#left-score");
  const rightScore = document.querySelector("#right-score");

  function paintScores() {
    leftName.value = scores.leftName;
    rightName.value = scores.rightName;
    leftScore.textContent = scores.leftScore;
    rightScore.textContent = scores.rightScore;
    localStorage.setItem(SCORES_KEY, JSON.stringify(scores));
  }

  function paint() {
    const survey = surveys[index];
    count.textContent = index + 1 + " / " + surveys.length;
    question.textContent = survey.question;
    slots.innerHTML = Array.from({ length: 8 }, (_, i) => {
      const answer = survey.answers[i];
      if (!answer) return `<div class="slot empty"><span class="n">${i + 1}</span></div>`;
      const on = open.has(i) ? " on" : "";
      return `<button class="slot${on}" data-slot="${i}"><span class="n">${i + 1}</span><span class="body"><span>${escapeHtml(answer.text)}</span><span class="pts">${answer.points}</span></span></button>`;
    }).join("");
    strikeEls.forEach((el, i) => el.classList.toggle("on", strikes > i));
    paintScores();
  }

  function reveal(i) {
    const survey = surveys[index];
    if (!survey.answers[i] || open.has(i)) return;
    open.add(i);
    sounds.reveal();
    paint();
  }

  function addStrike() {
    if (strikes >= 3) return;
    strikes += 1;
    sounds.strike();
    bigx.hidden = false;
    setTimeout(() => { bigx.hidden = true; }, 700);
    paint();
  }

  function award(side) {
    const survey = surveys[index];
    let total = 0;
    open.forEach((i) => { total += survey.answers[i].points; });
    if (!total) return;
    scores[side] += total;
    sounds.points();
    flash.hidden = false;
    flash.textContent = "+" + total;
    setTimeout(() => { flash.hidden = true; }, 1100);
    paintScores();
  }

  function resetScores() {
    if (!confirm("Reset both team scores to 0?")) return;
    scores.leftScore = 0;
    scores.rightScore = 0;
    paintScores();
  }

  function transfer(from, to) {
    const amount = scores[from];
    if (!amount) return;
    scores[to] += amount;
    scores[from] = 0;
    sounds.points();
    flash.hidden = false;
    flash.textContent = "\u2192 " + amount;
    setTimeout(() => { flash.hidden = true; }, 1100);
    paintScores();
  }

  function go(delta) {
    index = (index + delta + surveys.length) % surveys.length;
    open = new Set();
    strikes = 0;
    sounds.next();
    paint();
  }

  slots.addEventListener("click", (e) => {
    const slot = e.target.closest("[data-slot]");
    if (slot) reveal(Number(slot.dataset.slot));
  });
  document.querySelector("#strike").addEventListener("click", addStrike);
  document.querySelector("#clear").addEventListener("click", () => { strikes = 0; paint(); });
  document.querySelector("#points-a").addEventListener("click", () => award("leftScore"));
  document.querySelector("#points-b").addEventListener("click", () => award("rightScore"));
  document.querySelector("#transfer-ab").addEventListener("click", () => transfer("leftScore", "rightScore"));
  document.querySelector("#transfer-ba").addEventListener("click", () => transfer("rightScore", "leftScore"));
  document.querySelector("#reset-scores").addEventListener("click", resetScores);
  document.querySelector("#prev").addEventListener("click", () => go(-1));
  document.querySelector("#next").addEventListener("click", () => go(1));
  document.querySelector("#mute").addEventListener("click", (e) => {
    e.currentTarget.textContent = sounds.toggle() ? "Sound off" : "Sound on";
  });
  leftName.addEventListener("input", () => { scores.leftName = leftName.value.toUpperCase(); paintScores(); });
  rightName.addEventListener("input", () => { scores.rightName = rightName.value.toUpperCase(); paintScores(); });

  window.addEventListener("keydown", (e) => {
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
    const key = e.key.toLowerCase();
    if (key >= "1" && key <= "8") reveal(Number(key) - 1);
    if (key === " " || key === "x") { e.preventDefault(); addStrike(); }
    if (key === "n" || key === "arrowright") go(1);
    if (key === "arrowleft") go(-1);
    if (key === "r") { strikes = 0; paint(); }
    if (key === "s") award(e.shiftKey ? "rightScore" : "leftScore");
    if (key === "m") document.querySelector("#mute").click();
    if (key === "f") {
      if (!document.fullscreenElement) document.documentElement.requestFullscreen();
      else document.exitFullscreen();
    }
  });

  if (!surveys.length) {
    question.textContent = "Add a question first.";
    return;
  }
  paint();
}

document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.page;
  if (page === "admin") bootAdmin();
  if (page === "board") bootBoard();
  if (page === "home") nav("home");
});
