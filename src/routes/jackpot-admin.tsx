import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Eye, EyeOff, Plus, RotateCcw, Save, ShieldAlert, Timer, Trophy } from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { defaultJackpotState, getCurrentQuestion, getRemainingSeconds, loadJackpotState, normalizeQuestion, resetTimer, saveJackpotState, type JackpotAnswer, type JackpotState } from "@/lib/jackpot";

export const Route = createFileRoute("/jackpot-admin")({ component: JackpotAdmin });

function JackpotAdmin() {
  const [state, setState] = useState<JackpotState | null>(null);
  const [draftQuestion, setDraftQuestion] = useState("");
  const [draftAnswers, setDraftAnswers] = useState<JackpotAnswer[]>(emptyAnswers());
  const [scoreDraft, setScoreDraft] = useState<[string, string]>(["0", "0"]);
  const [notice, setNotice] = useState("Connecting to Supabase…");
  const [saving, setSaving] = useState(false);
  const [, setClockTick] = useState(0);

  useEffect(() => {
    let alive = true;
    const refresh = async () => {
      try {
        const remote = await loadJackpotState();
        if (!alive) return;
        setState(remote);
        setNotice("Connected · changes sync to the TV board");
      } catch (err) {
        if (!alive) return;
        setNotice(err instanceof Error ? err.message : "Unable to connect to Supabase.");
      }
    };
    void refresh();
    const poll = window.setInterval(() => void refresh(), 1500);
    const clock = window.setInterval(() => setClockTick((tick) => tick + 1), 500);
    return () => { alive = false; window.clearInterval(poll); window.clearInterval(clock); };
  }, []);

  useEffect(() => {
    if (!state) return;
    const q = getCurrentQuestion(state);
    setDraftQuestion(q?.question ?? "");
    setDraftAnswers(q ? Array.from({ length: 10 }, (_, i) => q.answers[i] ?? blankAnswer()) : emptyAnswers());
    setScoreDraft([String(state.scores[0] ?? 0), String(state.scores[1] ?? 0)]);
 
  }, [state?.currentQuestion, state?.updatedAt]);

  async function commit(next: JackpotState, message = "Changes saved and synced to the board.") {
    setState(next);
    setSaving(true);
    try {
      await saveJackpotState(next);
      setNotice(message);
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Save failed. Check the Supabase setup.");
    } finally {
      setSaving(false);
    }
  }

  function updateAnswer(index: number, patch: Partial<JackpotAnswer>) {
    setDraftAnswers((current) => current.map((answer, i) => i === index ? { ...answer, ...patch } : answer));
  }

  function saveQuestion(addNew = false) {
    if (!state) return;
    const cleaned = normalizeQuestion(draftQuestion, draftAnswers);
    if (!cleaned.question || !cleaned.answers.length) {
      setNotice("Enter a question and at least one answer.");
      return;
    }
    const questions = [...state.questions];
    if (addNew) {
      questions.push(cleaned);
      void commit({ ...resetTimer(state), questions, currentQuestion: questions.length - 1 }, "New question added.");
    } else {
      questions[state.currentQuestion] = cleaned;
      void commit({ ...state, questions }, "Current question updated.");
    }
  }

  function update(patch: Partial<JackpotState>, message?: string) {
    if (state) void commit({ ...state, ...patch }, message);
  }

  function toggleReveal(index: number) {
    if (!state) return;
    const questions = state.questions.map((question, qIndex) => qIndex !== state.currentQuestion ? question : {
      ...question,
      answers: question.answers.map((answer, answerIndex) => answerIndex === index ? { ...answer, revealed: !answer.revealed } : answer),
    });
    update({ questions });
  }

  function changeQuestion(index: number) {
    if (!state || index < 0 || index >= state.questions.length) return;
    void commit({ ...resetTimer(state), currentQuestion: index }, "Question selected.");
  }

  function saveScores() {
    if (!state) return;
    update({ scores: [Number(scoreDraft[0]) || 0, Number(scoreDraft[1]) || 0] }, "Scores updated.");
  }

  function startTimer() {
    if (!state) return;
    const remaining = getRemainingSeconds(state);
    update({ timerSeconds: remaining > 0 ? remaining : 20, timerRunning: true, timerStartedAt: Date.now() }, "Timer started.");
  }

  function stopTimer() {
    if (!state) return;
    update({ timerSeconds: getRemainingSeconds(state), timerRunning: false, timerStartedAt: null }, "Timer paused.");
  }

  function resetRound() {
    if (!state) return;
    const questions = state.questions.map((question, index) => index === state.currentQuestion
      ? { ...question, answers: question.answers.map((answer) => ({ ...answer, revealed: false })) }
      : question);
    void commit({ ...resetTimer(state), questions }, "Round reset.");
  }

  function newGame() {
    if (!state || !window.confirm("Start a new game? This resets both scores, the timer, and all revealed answers.")) return;
    const questions = state.questions.map((question) => ({ ...question, answers: question.answers.map((answer) => ({ ...answer, revealed: false })) }));
    void commit({ ...defaultJackpotState(), questions }, "New game started.");
  }

  const current = state ? getCurrentQuestion(state) : null;

  return (
    <main className="min-h-screen bg-[#071422] text-[#f4efe4]">
      <SiteNav />
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-extrabold tracking-[0.3em] text-[#9ec4ff]">HOST CONTROL CENTER</p>
            <h1 className="font-[family-name:var(--font-display)] text-5xl tracking-wide text-[#f0c43a]">JACKPOT ADMIN</h1>
          </div>
          <Link to="/jackpot" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#f0c43a]/50 px-4 py-2 font-bold text-[#f0c43a] hover:bg-[#f0c43a] hover:text-[#071422]">
            <ArrowLeft className="h-4 w-4" /> TV / Player Screen
          </Link>
        </header>

        <div className="mb-5 flex items-start gap-3 rounded-xl border border-amber-400/30 bg-amber-950/30 p-4 text-sm text-amber-100">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
          <p><strong>No-login admin is enabled.</strong> Anyone with access to this page can control the shared game. Only use this for your private game session; do not store personal information here.</p>
        </div>

        <div className="mb-5 rounded-xl border border-white/10 bg-[#10243f] px-4 py-3 text-sm">
          <span className={saving ? "text-amber-300" : "text-emerald-300"}>{saving ? "Saving…" : notice}</span>
        </div>

        {!state ? (
          <div className="rounded-2xl border border-white/10 bg-[#10243f] p-8 text-center text-[#c5d4e8]">Loading admin controls…</div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
            <section className="space-y-5">
              <Panel title="Game controls">
                <div className="mb-4 grid grid-cols-3 gap-2">
                  <ActionButton onClick={startTimer}><Timer className="h-4 w-4" /> Start</ActionButton>
                  <ActionButton secondary onClick={stopTimer}>Pause</ActionButton>
                  <ActionButton secondary onClick={() => update(resetTimer(state), "Timer reset to 20 seconds.")}><RotateCcw className="h-4 w-4" /> Reset</ActionButton>
                </div>
                <div className="mb-4 rounded-xl bg-[#071422] p-4 text-center">
                  <span className="text-xs font-black tracking-[0.2em] text-[#9ec4ff]">TIME REMAINING</span>
                  <div className={`font-[family-name:var(--font-display)] text-6xl tabular-nums ${getRemainingSeconds(state) <= 5 ? "text-rose-400" : "text-[#f0c43a]"}`}>{getRemainingSeconds(state)}</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <ActionButton secondary onClick={() => update({ activePlayer: state.activePlayer === 0 ? 1 : 0 }, "Player turn switched.")}>Switch Player</ActionButton>
                  <ActionButton secondary onClick={() => update({ scoresVisible: !state.scoresVisible }, state.scoresVisible ? "Scores hidden." : "Scores revealed.")}>{state.scoresVisible ? <><EyeOff className="h-4 w-4" /> Hide Scores</> : <><Eye className="h-4 w-4" /> Reveal Scores</>}</ActionButton>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <ActionButton secondary onClick={() => state.questions.length && changeQuestion((state.currentQuestion + 1) % state.questions.length)}>Next Question</ActionButton>
                  <ActionButton secondary onClick={resetRound}>Reset Round</ActionButton>
                  <ActionButton danger onClick={newGame}>New Game</ActionButton>
                </div>
              </Panel>

              <Panel title="Score adjustment">
                <div className="grid grid-cols-2 gap-3">
                  {[0, 1].map((player) => (
                    <label key={player} className="text-sm font-bold text-[#9ec4ff]">Player {player + 1}
                      <input type="number" value={scoreDraft[player]} onChange={(event) => setScoreDraft((old) => player === 0 ? [event.target.value, old[1]] : [old[0], event.target.value])} className="mt-1 min-h-12 w-full rounded-lg border border-white/15 bg-[#071422] px-3 text-2xl font-black text-[#f0c43a]" />
                    </label>
                  ))}
                </div>
                <button type="button" onClick={saveScores} className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#f0c43a] px-5 font-extrabold text-[#071422]"><Trophy className="h-4 w-4" /> Save scores</button>
              </Panel>

              <Panel title="Question bank">
                <div className="space-y-2">
                  {state.questions.map((question, index) => (
                    <button key={index} type="button" onClick={() => changeQuestion(index)} className={`flex min-h-12 w-full items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left text-sm font-semibold ${index === state.currentQuestion ? "border-[#f0c43a] bg-[#17365b] text-[#f0c43a]" : "border-white/10 bg-[#071422] text-[#d7e4f5]"}`}>
                      <span className="min-w-0 truncate">{index + 1}. {question.question}</span><span className="shrink-0 text-xs">{question.answers.length}/10</span>
                    </button>
                  ))}
                </div>
              </Panel>
            </section>

            <section className="space-y-5">
              <Panel title="Question & answers">
                <label className="block text-sm font-bold text-[#9ec4ff]">Question
                  <textarea rows={3} value={draftQuestion} onChange={(event) => setDraftQuestion(event.target.value)} className="mt-1 w-full rounded-lg border border-white/15 bg-[#071422] px-3 py-3 text-base text-[#f4efe4]" placeholder="Enter your question…" />
                </label>
                <div className="mt-4 grid grid-cols-[2.5rem_minmax(0,1fr)_5.5rem] gap-2 text-xs font-black tracking-wide text-[#9ec4ff]">
                  <span>#</span><span>ANSWER</span><span>POINTS</span>
                </div>
                <div className="mt-2 space-y-2">
                  {draftAnswers.map((answer, index) => (
                    <div key={index} className="grid grid-cols-[2.5rem_minmax(0,1fr)_5.5rem] items-center gap-2">
                      <span className="text-center font-black text-[#f0c43a]">{index + 1}</span>
                      <input value={answer.text} onChange={(event) => updateAnswer(index, { text: event.target.value })} className="min-h-11 min-w-0 rounded-lg border border-white/15 bg-[#071422] px-3" placeholder={`Answer ${index + 1}`} />
                      <input type="number" min="0" value={answer.points || ""} onChange={(event) => updateAnswer(index, { points: Number(event.target.value) })} className="min-h-11 w-full rounded-lg border border-white/15 bg-[#071422] px-2 text-center" placeholder="0" />
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <ActionButton onClick={() => saveQuestion(false)}><Save className="h-4 w-4" /> Update question</ActionButton>
                  <ActionButton secondary onClick={() => saveQuestion(true)}><Plus className="h-4 w-4" /> Add as new</ActionButton>
                </div>
              </Panel>

              <Panel title="Reveal answers on TV">
                <p className="mb-3 text-sm text-[#c5d4e8]">Tap a numbered answer to reveal or hide it on the player screen.</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                  {Array.from({ length: 10 }, (_, index) => {
                    const answer = current?.answers[index];
                    const revealed = Boolean(answer?.revealed);
                    return (
                      <button key={index} type="button" disabled={!answer} onClick={() => toggleReveal(index)} className={`flex min-h-16 flex-col items-center justify-center rounded-xl border-2 px-2 py-2 text-center disabled:opacity-30 ${revealed ? "border-emerald-400 bg-emerald-950/50 text-emerald-200" : "border-white/15 bg-[#071422] text-[#c5d4e8]"}`}>
                        <span className="text-lg font-black">{index + 1}</span>
                        <span className="max-w-full truncate text-[10px] font-bold">{answer?.text || "Empty"}</span>
                        <span className="text-[10px]">{revealed ? "REVEALED" : "HIDDEN"}</span>
                      </button>
                    );
                  })}
                </div>
              </Panel>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}

function emptyAnswers(): JackpotAnswer[] {
  return Array.from({ length: 10 }, () => blankAnswer());
}
function blankAnswer(): JackpotAnswer {
  return { text: "", points: 0, revealed: false };
}
function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-2xl border border-white/10 bg-[#10243f] p-4 sm:p-5"><h2 className="mb-4 text-sm font-black tracking-[0.18em] text-[#f0c43a]">{title.toUpperCase()}</h2>{children}</section>;
}
function ActionButton({ children, onClick, secondary = false, danger = false }: { children: React.ReactNode; onClick: () => void; secondary?: boolean; danger?: boolean }) {
  const style = danger ? "bg-rose-600 text-white" : secondary ? "border border-white/20 bg-[#071422] text-[#f4efe4] hover:border-[#f0c43a]" : "bg-[#f0c43a] text-[#071422] hover:bg-[#ffda63]";
  return <button type="button" onClick={onClick} className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-extrabold transition-colors ${style}`}>{children}</button>;
}
