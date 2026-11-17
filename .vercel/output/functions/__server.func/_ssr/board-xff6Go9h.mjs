import { i as __toESM } from "../_runtime.mjs";
import { q as require_react, x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as SiteNav } from "./site-nav-BEvhEbmb.mjs";
import { c as saveScores, r as loadSurveys, t as loadScores } from "./surveys-CWnq072e.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/board-xff6Go9h.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var ctx = null;
var muted = false;
function audio() {
	if (!ctx) ctx = new AudioContext();
	if (ctx.state === "suspended") ctx.resume();
	return ctx;
}
function tone(freq, duration, type, gainValue, when = 0) {
	if (muted) return;
	const a = audio();
	const osc = a.createOscillator();
	const gain = a.createGain();
	osc.type = type;
	osc.frequency.value = freq;
	const t = a.currentTime + when;
	gain.gain.setValueAtTime(1e-4, t);
	gain.gain.exponentialRampToValueAtTime(gainValue, t + .012);
	gain.gain.exponentialRampToValueAtTime(1e-4, t + duration);
	osc.connect(gain);
	gain.connect(a.destination);
	osc.start(t);
	osc.stop(t + duration + .02);
}
function buzz() {
	if (muted) return;
	const a = audio();
	const buffer = a.createBuffer(1, a.sampleRate * .35, a.sampleRate);
	const data = buffer.getChannelData(0);
	for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * .35;
	const src = a.createBufferSource();
	src.buffer = buffer;
	const filter = a.createBiquadFilter();
	filter.type = "lowpass";
	filter.frequency.value = 420;
	const gain = a.createGain();
	gain.gain.setValueAtTime(.35, a.currentTime);
	gain.gain.exponentialRampToValueAtTime(1e-4, a.currentTime + .35);
	src.connect(filter);
	filter.connect(gain);
	gain.connect(a.destination);
	src.start();
}
var sounds = {
	unlock() {
		audio();
	},
	reveal() {
		tone(880, .16, "sine", .28);
		tone(1175, .32, "sine", .22, .06);
	},
	strike() {
		tone(110, .42, "sawtooth", .22);
		tone(78, .4, "square", .12);
		buzz();
	},
	points() {
		[
			523,
			659,
			784,
			1046
		].forEach((f, i) => tone(f, .26, "triangle", .22, i * .07));
	},
	next() {
		tone(320, .14, "sine", .12);
		tone(480, .18, "sine", .1, .08);
	},
	toggleMute() {
		muted = !muted;
		return muted;
	},
	isMuted() {
		return muted;
	}
};
function BoardPage() {
	const [surveys, setSurveys] = (0, import_react.useState)([]);
	const [index, setIndex] = (0, import_react.useState)(0);
	const [open, setOpen] = (0, import_react.useState)([]);
	const [strikes, setStrikes] = (0, import_react.useState)(0);
	const [scores, setScores] = (0, import_react.useState)({
		leftName: "TEAM A",
		rightName: "TEAM B",
		leftScore: 0,
		rightScore: 0
	});
	const [flash, setFlash] = (0, import_react.useState)("");
	const [bigX, setBigX] = (0, import_react.useState)(false);
	const [muted, setMuted] = (0, import_react.useState)(false);
	const [ready, setReady] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setSurveys(loadSurveys());
		setScores(loadScores());
		setReady(true);
	}, []);
	const survey = surveys[index];
	function show(slot) {
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
	function award(side) {
		if (!survey) return;
		const total = open.reduce((sum, i) => sum + (survey.answers[i]?.points || 0), 0);
		if (!total) return;
		sounds.unlock();
		sounds.points();
		setScores((prev) => {
			const next = {
				...prev,
				leftScore: side === "left" ? prev.leftScore + total : prev.leftScore,
				rightScore: side === "right" ? prev.rightScore + total : prev.rightScore
			};
			saveScores(next);
			return next;
		});
		setFlash(`+${total}`);
		window.setTimeout(() => setFlash(""), 1100);
	}
	function go(nextIndex) {
		if (!surveys.length) return;
		const wrapped = (nextIndex + surveys.length) % surveys.length;
		sounds.next();
		setIndex(wrapped);
		setOpen([]);
		setStrikes(0);
	}
	(0, import_react.useEffect)(() => {
		function onKey(e) {
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
				if (!document.fullscreenElement) document.documentElement.requestFullscreen();
				else document.exitFullscreen();
			}
		}
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	});
	function rename(side, value) {
		setScores((prev) => {
			const next = {
				...prev,
				[side]: value.toUpperCase() || prev[side]
			};
			saveScores(next);
			return next;
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-screen flex-col bg-[#071422]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteNav, {}),
			!ready || !survey ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "p-8 text-center",
				children: "No surveys yet. Add one on the Questions page."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto flex w-full max-w-6xl flex-1 flex-col gap-3 px-3 py-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
						className: "grid grid-cols-[1fr_auto_1fr] items-stretch gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TeamCard, {
								name: scores.leftName,
								score: scores.leftScore,
								onName: (v) => rename("leftName", v)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "px-2 text-center",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-[family-name:var(--font-display)] text-2xl tracking-widest text-[#f0c43a] sm:text-4xl",
									children: "SHOWDOWN"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-xs font-bold tracking-[0.25em] text-[#9ec4ff]",
									children: [
										index + 1,
										" / ",
										surveys.length
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TeamCard, {
								name: scores.rightName,
								score: scores.rightScore,
								onName: (v) => rename("rightName", v)
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "rounded-xl border-2 border-[#f0c43a] bg-[#12315a] px-4 py-3 text-center text-lg font-extrabold sm:text-2xl",
						children: survey.question
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid flex-1 grid-cols-1 gap-2 sm:grid-cols-2",
						children: Array.from({ length: 8 }, (_, i) => {
							const answer = survey.answers[i];
							const shown = open.includes(i);
							if (!answer) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "min-h-14 rounded-lg border border-white/10 opacity-30" }, i);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => show(i),
								className: `flex min-h-16 items-stretch overflow-hidden rounded-lg border-2 text-left ${shown ? "animate-[flash_0.45s_ease] border-[#f0c43a] bg-[#0d2137] shadow-[0_0_18px_rgba(240,196,58,0.35)]" : "border-[#2a4a7a] bg-[#0d2137]"}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "flex w-12 items-center justify-center bg-[#1a3a6e] text-2xl font-black text-[#f0c43a]",
									children: i + 1
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex flex-1 items-center justify-between px-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: `text-base font-extrabold uppercase sm:text-xl ${shown ? "" : "opacity-0"}`,
										children: answer.text
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: `text-xl font-black text-[#f0c43a] ${shown ? "" : "opacity-0"}`,
										children: answer.points
									})]
								})]
							}, i);
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex items-center justify-center gap-3",
						children: [
							1,
							2,
							3
						].map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: `flex h-14 w-14 items-center justify-center rounded-xl border-4 text-3xl font-black ${strikes >= n ? "border-[#e23d4a] bg-[#2a0a0a] text-[#e23d4a]" : "border-[#555] text-transparent"}`,
							children: "X"
						}, n))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap justify-center gap-2 pb-2 text-sm font-bold",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "rounded-full bg-[#e23d4a] px-4 py-2",
								onClick: strike,
								children: "Strike"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "rounded-full bg-[#1a3a6e] px-4 py-2",
								onClick: () => setStrikes(0),
								children: "Clear X"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "rounded-full bg-[#f0c43a] px-4 py-2 text-[#071422]",
								onClick: () => award("left"),
								children: "Points A"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "rounded-full bg-[#f0c43a] px-4 py-2 text-[#071422]",
								onClick: () => award("right"),
								children: "Points B"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "rounded-full border border-white/30 px-4 py-2",
								onClick: () => go(index - 1),
								children: "Prev"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "rounded-full border border-white/30 px-4 py-2",
								onClick: () => go(index + 1),
								children: "Next"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "rounded-full border border-white/30 px-4 py-2",
								onClick: () => setMuted(sounds.toggleMute()),
								children: muted ? "Sound off" : "Sound on"
							})
						]
					})
				]
			}),
			bigX && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pointer-events-none fixed inset-0 flex items-center justify-center text-[40vw] font-black text-[#e23d4a]",
				children: "X"
			}),
			flash && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pointer-events-none fixed top-[38%] left-1/2 -translate-x-1/2 text-7xl font-black text-[#f0c43a]",
				children: flash
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("style", { children: `@keyframes flash { 0% { background:#f0c43a } 100% { background:#0d2137 } }` })
		]
	});
}
function TeamCard({ name, score, onName }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl border-2 border-[#f0c43a] bg-[#10243f] px-3 py-2 text-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			"aria-label": "Team name",
			value: name,
			onChange: (e) => onName(e.target.value),
			className: "w-full bg-transparent text-center text-xs font-bold tracking-[0.18em] text-[#f0c43a] outline-none sm:text-sm"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-3xl font-black sm:text-5xl",
			children: score
		})]
	});
}
//#endregion
export { BoardPage as component };
