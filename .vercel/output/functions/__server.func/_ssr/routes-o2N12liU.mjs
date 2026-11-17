import { x as require_jsx_runtime, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as SiteNav } from "./site-nav-BEvhEbmb.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-o2N12liU.js
var import_jsx_runtime = require_jsx_runtime();
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "min-h-screen bg-[radial-gradient(circle_at_top,#16345c_0%,#071422_55%)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteNav, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mx-auto flex max-w-5xl flex-col gap-8 px-5 py-10 md:py-16",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-bold tracking-[0.35em] text-[#9ec4ff]",
							children: "LIVE SURVEY BOARD"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
							className: "mt-3 font-[family-name:var(--font-display)] text-6xl leading-none text-[#f0c43a] sm:text-8xl",
							children: [
								"SURVEY",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
								"SHOWDOWN"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mx-auto mt-4 max-w-xl text-lg text-[#d7e4f5]",
							children: "Host a survey round on a big screen. Reveal answers, drop strikes, and bank the points."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-8 flex flex-wrap justify-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/board",
								className: "rounded-full bg-[#f0c43a] px-6 py-3 text-lg font-extrabold text-[#071422]",
								children: "Open the board"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/admin",
								className: "rounded-full border border-[#f0c43a] px-6 py-3 text-lg font-bold text-[#f0c43a]",
								children: "Edit questions"
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-4 md:grid-cols-3",
					children: [
						[
							"1",
							"Write surveys",
							"Add a question and up to eight ranked answers on the Questions page."
						],
						[
							"2",
							"Project the board",
							"Open Board on the room screen. Keys 1–8 flip an answer with a flash."
						],
						[
							"3",
							"Keep score",
							"Space adds a strike. S banks the revealed points for team A, Shift+S for team B."
						]
					].map(([n, title, body]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "rounded-2xl border border-[#f0c43a]/25 bg-[#0c1c33] p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-[family-name:var(--font-display)] text-4xl text-[#f0c43a]",
								children: n
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mt-1 text-xl font-bold",
								children: title
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-[#c5d4e8]",
								children: body
							})
						]
					}, n))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-2xl border border-white/10 bg-black/25 p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-bold tracking-[0.2em] text-[#f0c43a]",
						children: "BOARD KEYS"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
						className: "mt-3 grid gap-2 text-sm text-[#d7e4f5] sm:grid-cols-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "1–8 reveal that answer" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Space or X adds a strike" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "N or right arrow goes to the next survey" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "R clears strikes" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "S awards points to team A" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Shift+S awards points to team B" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "M mutes sound, F toggles fullscreen" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Click or tap a slot to reveal it" })
						]
					})]
				})
			]
		})]
	});
}
//#endregion
export { Home as component };
