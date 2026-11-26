/* JACKPOT admin. Anyone with this page can control the shared game. */
const JP_SUPABASE_URL = "https://twzywooeefkbldrphsie.supabase.co";
const JP_SUPABASE_KEY = "sb_publishable_A1gGz_adW1DT8zIoyBIoww_K3AP1RZd";
const JP = window.supabase.createClient(JP_SUPABASE_URL, JP_SUPABASE_KEY);
const ROUND_SECONDS = 25;
const $ = (id) => document.getElementById(id);
let state = null;
let saveBusy = false;

function base() {
  return {
    questions: [{
      question: "Name something people bring to a party.",
      answers: [
        { text: "Food", points: 35, revealed: false },
        { text: "Drinks", points: 25, revealed: false },
        { text: "Music", points: 15, revealed: false },
      ],
    }],
    currentQuestion: 0,
    scores: [0, 0],
    activePlayer: 0,
    timerSeconds: ROUND_SECONDS,
    timerRunning: false,
    timerStartedAt: null,
    scoresVisible: false,
  };
}

function q() {
  return state?.questions?.[state.currentQuestion] || null;
}

function remaining() {
  if (!state || !state.timerRunning || !state.timerStartedAt) return state?.timerSeconds ?? ROUND_SECONDS;
  return Math.max(0, Math.ceil((state.timerSeconds * 1000 - (Date.now() - state.timerStartedAt)) / 1000));
}

function resetClock() {
  state.timerSeconds = ROUND_SECONDS;
  state.timerRunning = false;
  state.timerStartedAt = null;
}

function padAnswers(question) {
  if (!Array.isArray(question.answers)) question.answers = [];
  while (question.answers.length < 10) question.answers.push({ text: "", points: 0, revealed: false });
}

async function save() {
  if (saveBusy) return;
  saveBusy = true;
  state.timerSeconds = remaining();
  if (state.timerSeconds <= 0) {
    state.timerRunning = false;
    state.timerStartedAt = null;
  }
  const { error } = await JP.from("jackpot_state").upsert({ id: "main", state, updated_at: new Date().toISOString() });
  saveBusy = false;
  $("adminStatus").textContent = error ? "Save failed: " + error.message : "Synced to the jackpot board";
  $("adminStatus").className = "jp-status " + (error ? "error" : "ok");
  render();
}

function render() {
  if (!state) return;
  const current = q();
  const editingQuestion = document.activeElement && ($("questionInput") === document.activeElement || $("answerInputs").contains(document.activeElement));
  const editingReveal = document.activeElement && $("revealButtons").contains(document.activeElement);
  if (!editingQuestion) $("questionInput").value = current?.question || "";
  $("score1Input").value = state.scores[0] ?? 0;
  $("score2Input").value = state.scores[1] ?? 0;
  $("toggleScores").textContent = state.scoresVisible ? "Hide Scores" : "Reveal Scores";
  $("resetTimer").textContent = "↻ Reset " + ROUND_SECONDS + "s";

  if (!editingQuestion) {
    const editor = $("answerInputs");
    editor.innerHTML = "";
    for (let i = 0; i < 10; i++) {
      const answer = current?.answers?.[i] || { text: "", points: 0 };
      const row = document.createElement("div");
      row.className = "jp-answer-editor";
      row.style.gridColumn = "1 / -1";
      row.innerHTML = `<input aria-label="Answer ${i + 1}" placeholder="Answer ${i + 1}"><input aria-label="Points ${i + 1}" type="number" placeholder="Points">`;
      row.children[0].value = answer.text || "";
      row.children[1].value = answer.points || "";
      editor.append(row);
    }
  }

  if (!editingReveal) {
    const reveal = $("revealButtons");
    reveal.innerHTML = "";
    for (let i = 0; i < 10; i++) {
      const answer = current?.answers?.[i] || { text: "", points: 0, revealed: false };
      const row = document.createElement("div");
      row.className = "jp-reveal-row";
      row.innerHTML = `<span class="jp-reveal-num">${i + 1}</span><input aria-label="Reveal answer ${i + 1}" placeholder="Answer ${i + 1}"><input aria-label="Reveal points ${i + 1}" type="number" placeholder="Points"><button type="button" class="jp-button">Show</button><button type="button" class="jp-button secondary">Hide</button>`;
      const textInput = row.children[1];
      const pointsInput = row.children[2];
      const showButton = row.children[3];
      const hideButton = row.children[4];
      textInput.value = answer.text || "";
      pointsInput.value = answer.points || "";
      showButton.className = "jp-button" + (answer.revealed ? " revealed" : "");
      showButton.textContent = answer.revealed ? "Update" : "Show";
      showButton.onclick = () => {
        showButton.blur();
        const live = q();
        if (!live) return;
        const text = textInput.value.trim();
        if (!text) {
          $("adminStatus").textContent = "Type an answer, then click Show.";
          return;
        }
        padAnswers(live);
        live.answers[i] = { text, points: Math.max(0, Math.round(Number(pointsInput.value) || 0)), revealed: true };
        save();
      };
      hideButton.onclick = () => {
        hideButton.blur();
        const live = q();
        if (!live?.answers?.[i]) return;
        live.answers[i].revealed = false;
        save();
      };
      reveal.append(row);
    }
  }

  const list = $("questionList");
  list.innerHTML = "";
  state.questions.forEach((item, i) => {
    const row = document.createElement("div");
    row.className = "jp-question-item" + (i === state.currentQuestion ? " current" : "");
    const title = document.createElement("span");
    title.textContent = `${i + 1}. ${item.question}`;
    const actions = document.createElement("div");
    actions.className = "jp-control-row";
    const editBtn = document.createElement("button");
    editBtn.className = "jp-button secondary";
    editBtn.type = "button";
    editBtn.textContent = "Edit";
    editBtn.onclick = () => {
      state.currentQuestion = i;
      resetClock();
      save();
    };
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "jp-button danger";
    deleteBtn.type = "button";
    deleteBtn.textContent = "Delete";
    deleteBtn.onclick = () => {
      if (!confirm("Delete this question?")) return;
      state.questions.splice(i, 1);
      if (!state.questions.length) state.questions.push({ question: "New question", answers: [] });
      if (state.currentQuestion >= state.questions.length) state.currentQuestion = state.questions.length - 1;
      resetClock();
      save();
    };
    actions.append(editBtn, deleteBtn);
    row.append(title, actions);
    list.append(row);
  });
}

async function init() {
  const { data, error } = await JP.from("jackpot_state").select("state").eq("id", "main").maybeSingle();
  if (error) {
    $("adminStatus").textContent = "Supabase connection error. Verify URL/key and run SQL.";
    return;
  }
  state = data?.state || base();
  if (!data) await JP.from("jackpot_state").insert({ id: "main", state });
  render();
  $("adminStatus").textContent = "Connected. Shared game is live.";
}

JP.channel("jackpot-admin-live").on("postgres_changes", { event: "*", schema: "public", table: "jackpot_state", filter: "id=eq.main" }, (payload) => {
  if (payload.new?.state && !saveBusy) {
    state = payload.new.state;
    render();
  }
}).subscribe();

$("startTimer").onclick = () => {
  if (remaining() <= 0) state.timerSeconds = ROUND_SECONDS;
  state.timerStartedAt = Date.now();
  state.timerRunning = true;
  save();
};
$("stopTimer").onclick = () => {
  state.timerSeconds = remaining();
  state.timerRunning = false;
  state.timerStartedAt = null;
  save();
};
$("resetTimer").onclick = () => {
  resetClock();
  save();
};
$("switchPlayer").onclick = () => {
  state.activePlayer = 1 - state.activePlayer;
  save();
};
$("toggleScores").onclick = () => {
  state.scoresVisible = !state.scoresVisible;
  save();
};
$("saveScores").onclick = () => {
  state.scores = [Number($("score1Input").value) || 0, Number($("score2Input").value) || 0];
  save();
};
$("nextQuestion").onclick = () => {
  if (state.currentQuestion < state.questions.length - 1) state.currentQuestion++;
  else state.currentQuestion = 0;
  resetClock();
  save();
};
$("resetRound").onclick = () => {
  if (q()) q().answers.forEach((answer) => { answer.revealed = false; });
  resetClock();
  save();
};
$("newGame").onclick = () => {
  if (!confirm("Start a new game? This resets scores, answers and question selection.")) return;
  state.scores = [0, 0];
  state.currentQuestion = 0;
  state.activePlayer = 0;
  state.scoresVisible = false;
  resetClock();
  state.questions.forEach((question) => question.answers.forEach((answer) => { answer.revealed = false; }));
  save();
};

function readEditedQuestion() {
  const question = $("questionInput").value.trim();
  if (!question) {
    alert("Enter a question first.");
    return null;
  }
  const previous = q()?.answers || [];
  const rows = [...$("answerInputs").children];
  const answers = rows.map((row, i) => {
    const text = row.children[0].value.trim();
    const points = Math.max(0, Math.round(Number(row.children[1].value) || 0));
    const same = previous[i] && previous[i].text === text;
    return { text, points, revealed: Boolean(same && previous[i].revealed) };
  }).filter((answer) => answer.text);
  if (answers.length > 10) {
    alert("Maximum 10 answers.");
    return null;
  }
  return { question, answers };
}

$("saveQuestion").onclick = () => {
  const edited = readEditedQuestion();
  if (!edited) return;
  if (!state.questions.length) {
    state.questions.push(edited);
    state.currentQuestion = 0;
  } else state.questions[state.currentQuestion] = edited;
  save();
};
$("addQuestion").onclick = () => {
  const added = readEditedQuestion();
  if (!added) return;
  state.questions.push(added);
  state.currentQuestion = state.questions.length - 1;
  resetClock();
  save();
};
$("clearEditor").onclick = () => {
  $("questionInput").value = "";
  [...$("answerInputs").children].forEach((row) => {
    row.children[0].value = "";
    row.children[1].value = "";
  });
};

init();
setInterval(() => {
  if (state?.timerRunning && remaining() <= 0) {
    state.timerSeconds = 0;
    state.timerRunning = false;
    state.timerStartedAt = null;
    save();
  }
}, 300);
