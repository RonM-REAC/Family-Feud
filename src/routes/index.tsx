import { createFileRoute, Link } from "@tanstack/react-router";
import { Gamepad2, MonitorPlay, Settings2 } from "lucide-react";
import { SiteNav } from "@/components/site-nav";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#16345c_0%,#071422_55%)]">
      <SiteNav />
      <section className="mx-auto flex max-w-5xl flex-col gap-8 px-5 py-10 md:py-16">
        <div className="text-center">
          <p className="text-xs font-bold tracking-[0.35em] text-[#9ec4ff]">LIVE SURVEY BOARD</p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-6xl leading-none text-[#f0c43a] sm:text-8xl">
            SURVEY<br />SHOWDOWN
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-[#d7e4f5]">
            Host a survey round on a big screen. Reveal answers, drop strikes, and bank the points.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/board" className="rounded-full bg-[#f0c43a] px-6 py-3 text-lg font-extrabold text-[#071422]">Open the board</Link>
            <Link to="/admin" className="rounded-full border border-[#f0c43a] px-6 py-3 text-lg font-bold text-[#f0c43a]">Edit questions</Link>
          </div>
        </div>

        <section className="rounded-3xl border-2 border-[#f0c43a]/50 bg-[#10243f] p-6 shadow-2xl sm:p-8">
          <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-[#f0c43a] text-[#071422]"><Gamepad2 className="h-9 w-9" /></div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-black tracking-[0.3em] text-[#9ec4ff]">A SECOND GAME MODE</p>
              <h2 className="mt-1 font-[family-name:var(--font-display)] text-4xl tracking-wide text-[#f0c43a] sm:text-5xl">JACKPOT</h2>
              <p className="mt-2 text-[#d7e4f5]">A fast two-player answer challenge with a 25-second timer, ten revealable answers, hidden scores, and a mobile-friendly host dashboard.</p>
            </div>
            <div className="flex shrink-0 flex-wrap justify-center gap-2">
              <Link to="/jackpot" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#f0c43a] px-5 py-2 font-extrabold text-[#071422]"><MonitorPlay className="h-4 w-4" /> Play</Link>
              <Link to="/jackpot-admin" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#f0c43a] px-5 py-2 font-bold text-[#f0c43a]"><Settings2 className="h-4 w-4" /> Host</Link>
            </div>
          </div>
        </section>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["1", "Write surveys", "Add a question and up to ten ranked answers on the Questions page."],
            ["2", "Project the board", "Open Board on the room screen. Keys 1–9 and 0 flip an answer with a flash."],
            ["3", "Keep score", "Space adds a strike. S banks the revealed points for team A, Shift+S for team B."],
          ].map(([n, title, body]) => (
            <article key={n} className="rounded-2xl border border-[#f0c43a]/25 bg-[#0c1c33] p-5">
              <div className="font-[family-name:var(--font-display)] text-4xl text-[#f0c43a]">{n}</div>
              <h2 className="mt-1 text-xl font-bold">{title}</h2>
              <p className="mt-2 text-[#c5d4e8]">{body}</p>
            </article>
          ))}
        </div>

        <section className="rounded-2xl border border-white/10 bg-black/25 p-5">
          <h2 className="text-sm font-bold tracking-[0.2em] text-[#f0c43a]">BOARD KEYS</h2>
          <ul className="mt-3 grid gap-2 text-sm text-[#d7e4f5] sm:grid-cols-2">
            <li>1–9 and 0 reveal that answer (0 is answer 10)</li>
            <li>Space or X adds a strike</li>
            <li>N or right arrow goes to the next survey</li>
            <li>R clears strikes</li>
            <li>S awards points to team A</li>
            <li>Shift+S awards points to team B</li>
            <li>M mutes sound, F toggles fullscreen</li>
            <li>Click or tap a slot to reveal it</li>
          </ul>
        </section>
      </section>
    </main>
  );
}
