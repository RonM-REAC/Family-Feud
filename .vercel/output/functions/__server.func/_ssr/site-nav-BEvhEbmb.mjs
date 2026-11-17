import { x as require_jsx_runtime, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/site-nav-BEvhEbmb.js
var import_jsx_runtime = require_jsx_runtime();
var links = [
	{
		to: "/",
		label: "Home"
	},
	{
		to: "/board",
		label: "Board"
	},
	{
		to: "/admin",
		label: "Questions"
	}
];
function SiteNav({ tone = "bar" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
		className: tone === "bar" ? "flex flex-wrap items-center justify-between gap-3 border-b border-[#f0c43a]/30 bg-[#071422]/90 px-4 py-3" : "flex flex-wrap gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/",
			className: "font-[family-name:var(--font-display)] tracking-[0.18em] text-[#f0c43a]",
			children: "SURVEY SHOWDOWN"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex gap-2 text-sm font-semibold",
			children: links.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: item.to,
				className: "rounded-full border border-[#f0c43a]/40 px-3 py-1 text-[#f4efe4] hover:bg-[#f0c43a] hover:text-[#071422]",
				activeProps: { className: "bg-[#f0c43a] text-[#071422]" },
				activeOptions: { exact: true },
				children: item.label
			}, item.to))
		})]
	});
}
//#endregion
export { SiteNav as t };
