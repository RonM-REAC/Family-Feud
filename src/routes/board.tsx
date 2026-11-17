import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteNav } from "@/components/site-nav";
import { sounds } from "@/lib/sounds";
import { loadScores, loadSurveys, saveScores, type ScoreState, type Survey } from "@/lib/surveys";

export const Route = createFileRoute("/board")({ component: BoardPage });

function BoardPage() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState<number[]>([]);
  const [strikes, setStrikes] = useState(0);
  const [scores, setScores] = useState<ScoreState>({
    leftName: "TEAM A",
    rightName: "TEAM B",
    leftScore: 0,
    rightScore: 0,
  });
  const [flash, setFlash] = useState("");
  const [bigX, setBigX] = useState(false);
  const [muted, setMuted] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSurveys(loadSurveys());
    setScores(loadScores());
    setReady(true);
  }, []);

  const survey = surveys[index];

  function show(slot: number) {
    if (!survey || slot >= survey.answers.length || open.includes(slot)) return;
    sounds.unlock();
    sounds.reveal();
    setOpen((prev) => [...prev, slot]);
  }

  function strike() {
    if (strikes >= 3) return;
    sounds.unlock();
    sounds.strike();
    setStrikes((n) => n + 1);
    setBigX(true);
    window.setTimeout(() => setBigX(false), 700);
  }

  function award(side: "left" | "right") {
    if (!survey) return;
    const total = open.reduce((sum, i) => sum + (survey.answers[i]?.points || 0), 0);
    if (!total) return;
    sounds.unlock();
    sounds.points();
    setScores((prev) => {
      const next = {
        ...prev,
        leftScore: side === "left" ? prev.leftScore + total : prev.leftScore,
        rightScore: side === "right" ? prev.rightScore + total : prev.rightScore,
      };
      saveScores(next);
      return next;
    });
    setFlash(`+${total}`);
    window.setTimeout(() => setFlash(""), 1100);
  }

  function go(nextIndex: number) {
    if (!surveys.length) return;
    const wrapped = (nextIndex + surveys.length) % surveys.length;
    sounds.next();
    setIndex(wrapped);
    setOpen([]);
    setStrikes(0);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const key = e.key.toLowerCase();
      if (key >= "1" && key <= "8") show(Number(key) - 1);
      if (key === " " || key === "x") {
        e.preventDefault();
        strike();
      }
      if (key === "n" || key === "arrowright") go(index + 1);
      if (key === "arrowleft") go(index - 1);
      if (key === "r") setStrikes(0);
      if (key === "s") award(e.shiftKey ? "right" : "left");
      if (key === "m") setMuted(sounds.toggleMute());
      if (key === "f") {
        if (!document.fullscreenElement) void document.documentElement.requestFullscreen();
        else void document.exitFullscreen();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function rename(side: "leftName" | "rightName", value: string) {
    setScores((prev) => {
      const next = { ...prev, [side]: value.toUpperCase() || prev[side] };
      saveScores(next);
      return next;
    });
  }

  return (
    <main className="flex min-h-screen flex-col bg-[#071422]">
      <SiteNav />
      {!ready || !survey ? (
        <p className="p-8 text-center">No surveys yet. Add one on the Questions page.</p>
      ) : (
        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-3 px-3 py-3">
          <header className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-2">
            <TeamCard
              name={scores.leftName}
              score={scores.leftScore}
              onName={(v) => rename("leftName", v)}
            />
            <div className="px-2 text-center">
              <div className="font-[family-name:var(--font-display)] text-2xl tracking-widest text-[#f0c43a] sm:text-4xl">
                SHOWDOWN
              </div>
              <div className="text-xs font-bold tracking-[0.25em] text-[#9ec4ff]">
                {index + 1} / {surveys.length}
              </div>
            </div>
            <TeamCard
              name={scores.rightName}
              score={scores.rightScore}
              onName={(v) => rename("rightName", v)}
            />
          </header>

          <div className="rounded-xl border-2 border-[#f0c43a] bg-[#12315a] px-4 py-3 text-center text-lg font-extrabold sm:text-2xl">
            {survey.question}
          </div>

          <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-2">
            {Array.from({ length: 8 }, (_, i) => {
              const answer = survey.answers[i];
              const shown = open.includes(i);
              if (!answer) {
                return <div key={i} className="min-h-14 rounded-lg border border-white/10 opacity-30" />;
              }
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => show(i)}
                  className={`flex min-h-16 items-stretch overflow-hidden rounded-lg border-2 text-left ${
                    shown
                      ? "animate-[flash_0.45s_ease] border-[#f0c43a] bg-[#0d2137] shadow-[0_0_18px_rgba(240,196,58,0.35)]"
                      : "border-[#2a4a7a] bg-[#0d2137]"
                  }`}
                >
                  <span className="flex w-12 items-center justify-center bg-[#1a3a6e] text-2xl font-black text-[#f0c43a]">
                    {i + 1}
                  </span>
                  <span className="flex flex-1 items-center justify-between px-3">
                    <span className={`text-base font-extrabold uppercase sm:text-xl ${shown ? "" : "opacity-0"}`}>
                      {answer.text}
                    </span>
                    <span className={`text-xl font-black text-[#f0c43a] ${shown ? "" : "opacity-0"}`}>
                      {answer.points}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-3">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className={`flex h-14 w-14 items-center justify-center rounded-xl border-4 text-3xl font-black ${
                  strikes >= n ? "border-[#e23d4a] bg-[#2a0a0a] text-[#e23d4a]" : "border-[#555] text-transparent"
                }`}
              >
                X
              </div>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-2 pb-2 text-sm font-bold">
            <button type="button" className="rounded-full bg-[#e23d4a] px-4 py-2" onClick={strike}>
              Strike
            </button>
            <button type="button" className="rounded-full bg-[#1a3a6e] px-4 py-2" onClick={() => setStrikes(0)}>
              Clear X
            </button>
            <button type="button" className="rounded-full bg-[#f0c43a] px-4 py-2 text-[#071422]" onClick={() => award("left")}>
              Points A
            </button>
            <button type="button" className="rounded-full bg-[#f0c43a] px-4 py-2 text-[#071422]" onClick={() => award("right")}>
              Points B
            </button>
            <button type="button" className="rounded-full border border-white/30 px-4 py-2" onClick={() => go(index - 1)}>
              Prev
            </button>
            <button type="button" className="rounded-full border border-white/30 px-4 py-2" onClick={() => go(index + 1)}>
              Next
            </button>
            <button
              type="button"
              className="rounded-full border border-white/30 px-4 py-2"
              onClick={() => setMuted(sounds.toggleMute())}
            >
              {muted ? "Sound off" : "Sound on"}
            </button>
          </div>
        </div>
      )}

      {bigX && (
        <div className="pointer-events-none fixed inset-0 flex items-center justify-center text-[40vw] font-black text-[#e23d4a]">
          X
        </div>
      )}
      {flash && (
        <div className="pointer-events-none fixed top-[38%] left-1/2 -translate-x-1/2 text-7xl font-black text-[#f0c43a]">
          {flash}
        </div>
      )}
      <style>{`@keyframes flash { 0% { background:#f0c43a } 100% { background:#0d2137 } }`}</style>
    </main>
  );
}

function TeamCard({
  name,
  score,
  onName,
}: {
  name: string;
  score: number;
  onName: (value: string) => void;
}) {
  return (
    <div className="rounded-xl border-2 border-[#f0c43a] bg-[#10243f] px-3 py-2 text-center">
      <input
        aria-label="Team name"
        value={name}
        onChange={(e) => onName(e.target.value)}
        className="w-full bg-transparent text-center text-xs font-bold tracking-[0.18em] text-[#f0c43a] outline-none sm:text-sm"
      />
      <div className="text-3xl font-black sm:text-5xl">{score}</div>
    </div>
  );
}
