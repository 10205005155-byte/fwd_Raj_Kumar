// TrackMe — personal tracking case study
// All data is saved in the browser with localStorage.

const KEYS = {
	entries: "tm-entries",
	habits: "tm-habit-log",
	goals: "tm-goals",
};

/* ---------- Helpers ---------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const TODAY = daysAgo(0);

function escapeHTML(str) {
	return String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

function load(key, fallback) {
	try {
		const raw = localStorage.getItem(key);
		return raw ? JSON.parse(raw) : structuredClone(fallback);
	} catch {
		return structuredClone(fallback);
	}
}

function save(key, value) {
	try {
		localStorage.setItem(key, JSON.stringify(value));
	} catch {
		/* storage blocked: data lives only for this visit */
	}
}

const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const category = (id) => CATEGORIES.find((c) => c.id === id) || CATEGORIES[0];

function formatAmount(amount, catId) {
	const c = category(catId);
	const n = Number(amount).toLocaleString(undefined, { maximumFractionDigits: 1 });
	return c.unit === "Nu." ? `Nu. ${n}` : `${n} ${c.unit}`;
}

function formatDate(iso, opts = { day: "numeric", month: "short" }) {
	return new Date(`${iso}T00:00`).toLocaleDateString(undefined, opts);
}

function lastNDays(n) {
	return Array.from({ length: n }, (_, i) => daysAgo(n - 1 - i));
}

function toast(message) {
	const el = $("#toast");
	if (!el) return;
	$(".toast-body", el).textContent = message;
	bootstrap.Toast.getOrCreateInstance(el, { delay: 2200 }).show();
}

/* ---------- Data ---------- */
const getEntries = () => load(KEYS.entries, SAMPLE_ENTRIES);
const saveEntries = (list) => save(KEYS.entries, list);
const getHabitLog = () => load(KEYS.habits, {});
const saveHabitLog = (log) => save(KEYS.habits, log);
const getGoals = () => load(KEYS.goals, DEFAULT_GOALS);
const saveGoals = (list) => save(KEYS.goals, list);

function addEntry(entry) {
	const list = getEntries();
	list.push({ id: newId(), ...entry });
	saveEntries(list);
}

function sumWhere(entries, catId, dates) {
	return entries
		.filter((e) => e.category === catId && dates.includes(e.date))
		.reduce((total, e) => total + Number(e.amount), 0);
}

function habitStreak(log) {
	let streak = 0;
	let offset = (log[TODAY] || []).length ? 0 : 1;
	while ((log[daysAgo(offset)] || []).length) {
		streak++;
		offset++;
	}
	return streak;
}

function entryRowHTML(e, withDelete = false) {
	const c = category(e.category);
	return `
		<li class="entry-row">
			<span class="entry-icon ${c.color}"><i class="bi ${c.icon}" aria-hidden="true"></i></span>
			<div class="flex-grow-1 min-w-0">
				<div class="fw-semibold text-truncate">${escapeHTML(e.title)}</div>
				<div class="small text-secondary">${c.name} · ${formatDate(e.date)}${e.note ? " · " + escapeHTML(e.note) : ""}</div>
			</div>
			<span class="entry-amount">${formatAmount(e.amount, e.category)}</span>
			${withDelete ? `<button type="button" class="btn-icon" data-delete="${e.id}" aria-label="Delete ${escapeHTML(e.title)}"><i class="bi bi-trash3"></i></button>` : ""}
		</li>`;
}

function fillCategorySelect(select) {
	select.innerHTML = CATEGORIES.map((c) => `<option value="${c.id}">${c.name} (${c.unit})</option>`).join("");
}

/* ---------- Dashboard (index.html) ---------- */
function initHome() {
	const week = lastNDays(7);

	function renderStats() {
		const entries = getEntries();
		$("#statSpentToday").textContent = formatAmount(sumWhere(entries, "expense", [TODAY]), "expense");
		$("#statWorkout").textContent = formatAmount(sumWhere(entries, "workout", week), "workout");
		$("#statStudy").textContent = formatAmount(sumWhere(entries, "study", week), "study");
		$("#statStreak").textContent = `${habitStreak(getHabitLog())} days`;
	}

	function renderHabits() {
		const log = getHabitLog();
		const done = log[TODAY] || [];
		$("#habitList").innerHTML = DEFAULT_HABITS.map(
			(h) => `
			<li>
				<label class="habit ${done.includes(h.id) ? "done" : ""}">
					<input type="checkbox" class="form-check-input" data-habit="${h.id}" ${done.includes(h.id) ? "checked" : ""} />
					<i class="bi ${h.icon}" aria-hidden="true"></i>
					<span>${h.name}</span>
				</label>
			</li>`
		).join("");
		const pct = Math.round((done.length / DEFAULT_HABITS.length) * 100);
		$("#habitProgress").textContent = `${done.length} of ${DEFAULT_HABITS.length} done`;
		$("#habitBar").style.width = `${pct}%`;
		$("#habitBar").parentElement.setAttribute("aria-valuenow", pct);
	}

	function renderChart() {
		const entries = getEntries();
		const totals = week.map((d) => sumWhere(entries, "expense", [d]));
		const max = Math.max(...totals, 1);
		$("#weekChart").innerHTML = week
			.map(
				(d, i) => `
			<div class="bar-col">
				<span class="bar-value">${totals[i] ? totals[i].toLocaleString() : ""}</span>
				<div class="bar-track"><div class="bar-fill ${d === TODAY ? "today" : ""}" style="height:${(totals[i] / max) * 100}%"></div></div>
				<span class="bar-label">${formatDate(d, { weekday: "short" })}</span>
			</div>`
			)
			.join("");
		$("#weekTotal").textContent = formatAmount(totals.reduce((a, b) => a + b, 0), "expense");
	}

	function renderRecent() {
		const recent = getEntries()
			.sort((a, b) => b.date.localeCompare(a.date))
			.slice(0, 5);
		$("#recentList").innerHTML = recent.length
			? recent.map((e) => entryRowHTML(e)).join("")
			: `<li class="text-secondary small py-3">No entries yet. Add one above.</li>`;
	}

	function renderAll() {
		renderStats();
		renderHabits();
		renderChart();
		renderRecent();
	}

	$("#habitList").addEventListener("change", (e) => {
		const id = e.target.dataset.habit;
		if (!id) return;
		const log = getHabitLog();
		const done = new Set(log[TODAY] || []);
		e.target.checked ? done.add(id) : done.delete(id);
		log[TODAY] = [...done];
		saveHabitLog(log);
		renderHabits();
		renderStats();
	});

	const form = $("#quickAdd");
	fillCategorySelect(form.elements.category);
	form.addEventListener("submit", (e) => {
		e.preventDefault();
		if (!form.checkValidity()) {
			form.classList.add("was-validated");
			return;
		}
		addEntry({
			date: TODAY,
			category: form.elements.category.value,
			title: form.elements.title.value.trim(),
			amount: Number(form.elements.amount.value),
			note: "",
		});
		form.reset();
		form.classList.remove("was-validated");
		renderAll();
		toast("Entry added for today.");
	});

	$("#todayLabel").textContent = new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });
	renderAll();
}

/* ---------- Log (log.html) ---------- */
function initLog() {
	let filter = "all";
	const form = $("#entryForm");
	fillCategorySelect(form.elements.category);
	form.elements.date.value = TODAY;
	form.elements.date.max = TODAY;

	$("#filterGroup").innerHTML =
		`<button type="button" class="filter-pill active" data-filter="all" aria-pressed="true">All</button>` +
		CATEGORIES.map(
			(c) => `<button type="button" class="filter-pill" data-filter="${c.id}" aria-pressed="false"><i class="bi ${c.icon}"></i> ${c.name}</button>`
		).join("");

	function render() {
		const entries = getEntries().sort((a, b) => b.date.localeCompare(a.date));
		const shown = filter === "all" ? entries : entries.filter((e) => e.category === filter);

		$("#entryList").innerHTML = shown.map((e) => entryRowHTML(e, true)).join("");
		$("#emptyState").classList.toggle("d-none", shown.length > 0);
		$("#entryCount").textContent = `${shown.length} ${shown.length === 1 ? "entry" : "entries"}`;

		$("#totals").innerHTML = CATEGORIES.map((c) => {
			const total = entries.filter((e) => e.category === c.id).reduce((t, e) => t + Number(e.amount), 0);
			return `
				<div class="col">
					<div class="total-tile">
						<span class="entry-icon ${c.color}"><i class="bi ${c.icon}"></i></span>
						<div><div class="small text-secondary">${c.name} total</div><div class="fw-bold">${formatAmount(total, c.id)}</div></div>
					</div>
				</div>`;
		}).join("");
	}

	$("#filterGroup").addEventListener("click", (e) => {
		const btn = e.target.closest("[data-filter]");
		if (!btn) return;
		filter = btn.dataset.filter;
		$$("[data-filter]").forEach((b) => {
			b.classList.toggle("active", b === btn);
			b.setAttribute("aria-pressed", b === btn);
		});
		render();
	});

	$("#entryList").addEventListener("click", (e) => {
		const btn = e.target.closest("[data-delete]");
		if (!btn) return;
		saveEntries(getEntries().filter((x) => x.id !== btn.dataset.delete));
		render();
		toast("Entry deleted.");
	});

	form.addEventListener("submit", (e) => {
		e.preventDefault();
		if (!form.checkValidity()) {
			form.classList.add("was-validated");
			form.querySelector(":invalid")?.focus();
			return;
		}
		addEntry({
			date: form.elements.date.value,
			category: form.elements.category.value,
			title: form.elements.title.value.trim(),
			amount: Number(form.elements.amount.value),
			note: form.elements.note.value.trim(),
		});
		form.reset();
		form.elements.date.value = TODAY;
		form.classList.remove("was-validated");
		render();
		toast("Entry saved.");
	});

	form.elements.category.addEventListener("change", () => {
		$("#amountUnit").textContent = category(form.elements.category.value).unit;
	});
	$("#amountUnit").textContent = category(form.elements.category.value).unit;

	$("#resetData").addEventListener("click", () => {
		if (!confirm("Delete all your entries and habits and restore the sample data?")) return;
		try {
			Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
		} catch {
			/* storage blocked */
		}
		render();
		toast("Sample data restored.");
	});

	render();
}

/* ---------- Goals (goals.html) ---------- */
function initGoals() {
	const form = $("#goalForm");
	form.elements.due.min = TODAY;

	function render() {
		const goals = getGoals();
		$("#goalEmpty").classList.toggle("d-none", goals.length > 0);
		$("#goalGrid").innerHTML = goals
			.map((g) => {
				const pct = Math.min(100, Math.round((g.current / g.target) * 100));
				const daysLeft = Math.ceil((new Date(`${g.due}T00:00`) - new Date(`${TODAY}T00:00`)) / 86400000);
				const status = pct >= 100 ? ["success", "Completed"] : daysLeft < 0 ? ["danger", "Overdue"] : ["primary", `${daysLeft} days left`];
				return `
				<div class="col">
					<article class="goal-card h-100">
						<div class="d-flex justify-content-between align-items-start gap-2 mb-2">
							<h3 class="h6 fw-bold mb-0">${escapeHTML(g.title)}</h3>
							<button type="button" class="btn-icon" data-remove="${g.id}" aria-label="Remove goal"><i class="bi bi-x-lg"></i></button>
						</div>
						<span class="badge text-bg-${status[0]} bg-opacity-75 mb-3">${status[1]}</span>
						<div class="d-flex justify-content-between small mb-1">
							<span>${g.current.toLocaleString()} / ${g.target.toLocaleString()} ${escapeHTML(g.unit)}</span>
							<span class="fw-semibold">${pct}%</span>
						</div>
						<div class="progress mb-3" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100">
							<div class="progress-bar" style="width:${pct}%"></div>
						</div>
						<form class="input-group input-group-sm" data-progress="${g.id}">
							<input type="number" class="form-control" name="add" step="any" placeholder="Add progress" aria-label="Add progress to ${escapeHTML(g.title)}" required />
							<button class="btn btn-brand" type="submit"><i class="bi bi-plus-lg"></i></button>
						</form>
						<p class="small text-secondary mt-2 mb-0"><i class="bi bi-calendar-event me-1"></i>Due ${formatDate(g.due, { day: "numeric", month: "short", year: "numeric" })}</p>
					</article>
				</div>`;
			})
			.join("");
	}

	$("#goalGrid").addEventListener("click", (e) => {
		const btn = e.target.closest("[data-remove]");
		if (!btn) return;
		saveGoals(getGoals().filter((g) => g.id !== btn.dataset.remove));
		render();
		toast("Goal removed.");
	});

	$("#goalGrid").addEventListener("submit", (e) => {
		e.preventDefault();
		const f = e.target.closest("[data-progress]");
		const amount = Number(f.elements.add.value);
		if (!amount) return;
		const goals = getGoals();
		const goal = goals.find((g) => g.id === f.dataset.progress);
		goal.current = Math.max(0, goal.current + amount);
		saveGoals(goals);
		render();
		toast(goal.current >= goal.target ? "Goal reached — well done!" : "Progress updated.");
	});

	form.addEventListener("submit", (e) => {
		e.preventDefault();
		if (!form.checkValidity()) {
			form.classList.add("was-validated");
			return;
		}
		const goals = getGoals();
		goals.push({
			id: newId(),
			title: form.elements.title.value.trim(),
			target: Number(form.elements.target.value),
			current: 0,
			unit: form.elements.unit.value.trim(),
			due: form.elements.due.value,
		});
		saveGoals(goals);
		form.reset();
		form.classList.remove("was-validated");
		render();
		toast("Goal added.");
	});

	render();
}

/* ---------- Contact (contact.html) ---------- */
function initContact() {
	const form = $("#contactForm");
	form.addEventListener("submit", (e) => {
		e.preventDefault();
		if (!form.checkValidity()) {
			form.classList.add("was-validated");
			form.querySelector(":invalid")?.focus();
			return;
		}
		$("#contactSuccess").classList.remove("d-none");
		form.reset();
		form.classList.remove("was-validated");
	});
}

/* ---------- Start ---------- */
const PAGES = { home: initHome, log: initLog, goals: initGoals, contact: initContact };
PAGES[document.body.dataset.page]?.();
$$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
