import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Eye, EyeOff, Trophy, Timer, Wifi, WifiOff } from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { getCurrentQuestion, getRemainingSeconds, loadJackpotState, type JackpotState } from "@/lib/jackpot";

export const Route = createFileRoute("/jackpot")({ component: JackpotBoard });

function JackpotBoard() {
  const [state, setState] = useState<JackpotState | null>(null);
  const [error, setError] = useState("");
  const [connected, setConnected] = useState(false);
  const [seconds, setSeconds] = useState(20);

  useEffect(() => {
    let alive = true;
    const refresh = async () => {
      try {
        const next = await loadJackpotState();
        if (!alive) return;
        setState(next);
        setConnected(true);
        setError("");
      } catch (err) {
        if (!alive) return;
        setConnected(false);
        setError(err instanceof Error ? err.message : "Unable to connect to the game database.");
      }
    };
    void refresh();
    const poll = window.setInterval(() => void refresh(), 1200);
    const clock = window.setInterval(() => {
      setState((current) => {
        if (!current) return current;
        setSeconds(getRemainingSeconds(current));
        return current;
      });
    }, 200);
    return () => { alive = false; window.clearInterval(poll); window.clearInterval(clock); };
  }, []);

  useEffect(() => {
    if (state) setSeconds(getRemainingSeconds(state));
  }, [state?.timerSeconds, state?.timerRunning, state?.timerStartedAt]);

  const question = useMemo(() => state ? getCurrentQuestion(state) : null, [state]);
  const answers = question?.answers ?? [];

  return (
    <main className="min-h-screen bg-[#071422] text-[#f4efe4]">
      <SiteNav />
      <div className="mx-auto flex min-h-[calc(100vh-58px)] max-w-7xl flex-col px-3 py-4 sm:px-6 sm:py-6">
        <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-extrabold tracking-[0.35em] text-[#9ec4ff]">THE LIVE ANSWER CHALLENGE</p>
            <h1 className="font-[family-name:var(--font-display)] text-5xl tracking-wide text-[#f0c43a] sm:text-7xl">JACKPOT</h1>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-white/15 bg-[#10243f] px-4 py-2 text-sm">
            {connected ? <Wifi className="h-4 w-4 text-emerald-400" /> : <WifiOff className="h-4 w-4 text-rose-400" />}
            <span>{connected ? "LIVE SYNC" : "CONNECTING"}</span>
          </div>
        </header>

        {error && (
          <div className="mb-4 rounded-xl border border-rose-500/40 bg-rose-950/50 p-4 text-sm text-rose-100">
            <strong>Database connection issue:</strong> {error}
            <p className="mt-1 text-rose-200/80">The Supabase JACKPOT table and public policies must be installed before the board can sync.</p>
          </div>
        )}

        {!state ? (
          <div className="grid flex-1 place-items-center rounded-2xl border border-white/10 bg-[#10243f] p-8 text-center">
            <div><div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-[#f0c43a] border-t-transparent" /><p className="text-lg font-bold">Connecting to JACKPOT…</p></div>
          </div>
        ) : (
          <>
            <section className="mb-4 grid grid-cols-[1fr_auto_1fr] items-stretch gap-2 sm:gap-4">
              <ScoreCard label="PLAYER 1" score={state.scores[0]} visible={state.scoresVisible} active={state.activePlayer === 0} />
              <div className="flex min-w-20 flex-col items-center justify-center rounded-2xl border border-[#f0c43a]/40 bg-[#10243f] px-3 py-2 text-center">
                <Timer className="mb-1 h-5 w-5 text-[#f0c43a]" />
                <span className="text-[10px] font-black tracking-[0.2em] text-[#9ec4ff]">TIME LEFT</span>
                <strong className={`font-[family-name:var(--font-display)] text-4xl tabular-nums sm:text-6xl ${seconds <= 5 ? "text-rose-400" : "text-[#f0c43a]"}`}>{seconds}</strong>
              </div>
              <ScoreCard label="PLAYER 2" score={state.scores[1]} visible={state.scoresVisible} active={state.activePlayer === 1} />
            </section>

            <div className="mb-4 rounded-2xl border-2 border-[#f0c43a] bg-[#12315a] px-4 py-5 text-center shadow-lg sm:px-8">
              <p className="mb-2 text-xs font-extrabold tracking-[0.3em] text-[#9ec4ff]">QUESTION {state.currentQuestion + 1} · PLAYER {state.activePlayer + 1}'S TURN</p>
              <h2 className="text-xl font-extrabold sm:text-3xl">{question?.question ?? "No question selected yet"}</h2>
            </div>

            <section className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-2">
              {Array.from({ length: 10 }, (_, index) => {
                const answer = answers[index];
                const revealed = Boolean(answer?.revealed);
                return (
                  <div key={index} className={`flex min-h-16 items-center overflow-hidden rounded-xl border-2 transition-all ${revealed ? "border-[#f0c43a] bg-[#18365b]" : "border-[#2a4a7a] bg-[#0d2137]"}`}>
                    <span className="flex h-full min-h-16 w-14 shrink-0 items-center justify-center bg-[#1a3a6e] font-[family-name:var(--font-display)] text-3xl text-[#f0c43a]">{index + 1}</span>
                    <span className="flex min-w-0 flex-1 items-center justify-between gap-2 px-3">
                      <span className={`truncate text-base font-extrabold uppercase sm:text-xl ${revealed ? "text-[#f4efe4]" : "text-transparent"}`}>{answer?.text || " "}</span>
                      <span className={`text-xl font-black text-[#f0c43a] ${revealed ? "opacity-100" : "opacity-0"}`}>{answer?.points ?? ""}</span>
                    </span>
                    {revealed && <span className="pr-3 text-[#f0c43a]"><Trophy className="h-4 w-4" /></span>}
                  </div>
                );
              })}
            </section>

            <footer className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#10243f] px-4 py-3">
              <div className="flex items-center gap-2 text-sm font-bold text-[#c5d4e8]">
                {state.scoresVisible ? <Eye className="h-4 w-4 text-emerald-400" /> : <EyeOff className="h-4 w-4 text-rose-400" />}
                {state.scoresVisible ? "Scores revealed" : "Scores hidden"}
              </div>
              <p className="text-xs font-semibold tracking-wide text-[#9ec4ff]">CONTROLLED BY THE HOST</p>
            </footer>
          </>
        )}
      </div>
    </main>
  );
}

function ScoreCard({ label, score, visible, active }: { label: string; score: number; visible: boolean; active: boolean }) {
  return (
    <div className={`relative flex min-h-24 flex-col items-center justify-center overflow-hidden rounded-2xl border-2 px-2 py-3 text-center sm:min-h-32 ${active ? "border-[#f0c43a] bg-[#17365b]" : "border-white/15 bg-[#10243f]"}`}>
      <span className="text-[10px] font-black tracking-[0.22em] text-[#9ec4ff] sm:text-xs">{label}</span>
      <strong className="font-[family-name:var(--font-display)] text-4xl tabular-nums text-[#f0c43a] sm:text-6xl">{visible ? score : "— —"}</strong>
      {!visible && <div className="absolute inset-0 grid place-items-center bg-rose-700/90 text-xs font-black tracking-[0.2em] text-white">SCORE HIDDEN</div>}
      {active && <span className="mt-1 text-[9px] font-black tracking-[0.2em] text-[#f0c43a]">CURRENT PLAYER</span>}
    </div>
  );
}
