// Default data for TrackMe. Used the first time the app runs;
// after that, everything is read from localStorage.

const CATEGORIES = [
	{ id: "expense", name: "Expense", icon: "bi-wallet2", unit: "Nu.", color: "amber" },
	{ id: "workout", name: "Workout", icon: "bi-activity", unit: "min", color: "green" },
	{ id: "study", name: "Study", icon: "bi-book", unit: "hrs", color: "violet" },
	{ id: "sleep", name: "Sleep", icon: "bi-moon-stars", unit: "hrs", color: "cyan" },
];

const DEFAULT_HABITS = [
	{ id: "water", name: "Drink 8 glasses of water", icon: "bi-cup-straw" },
	{ id: "walk", name: "Walk 30 minutes", icon: "bi-person-walking" },
	{ id: "read", name: "Read 20 pages", icon: "bi-journal-text" },
	{ id: "code", name: "Practise coding 1 hour", icon: "bi-code-slash" },
	{ id: "phone", name: "No phone after 10 PM", icon: "bi-phone-vibrate" },
];

// Sample entries are dated relative to today so the dashboard always has data.
function daysAgo(n) {
	const d = new Date();
	d.setDate(d.getDate() - n);
	const pad = (x) => String(x).padStart(2, "0");
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const SAMPLE_ENTRIES = [
	{ id: "s1", date: daysAgo(0), category: "expense", title: "Lunch at canteen", amount: 120, note: "" },
	{ id: "s2", date: daysAgo(0), category: "workout", title: "Morning run", amount: 30, note: "Around the dzong road" },
	{ id: "s3", date: daysAgo(1), category: "study", title: "JavaScript arrays", amount: 2, note: "" },
	{ id: "s4", date: daysAgo(1), category: "expense", title: "Mobile recharge", amount: 299, note: "" },
	{ id: "s5", date: daysAgo(1), category: "sleep", title: "Night sleep", amount: 7, note: "" },
	{ id: "s6", date: daysAgo(2), category: "workout", title: "Football", amount: 60, note: "" },
	{ id: "s7", date: daysAgo(2), category: "expense", title: "Groceries", amount: 850, note: "Rice, vegetables, eggs" },
	{ id: "s8", date: daysAgo(3), category: "study", title: "Bootstrap grid", amount: 1.5, note: "" },
	{ id: "s9", date: daysAgo(3), category: "sleep", title: "Night sleep", amount: 6, note: "" },
	{ id: "s10", date: daysAgo(4), category: "expense", title: "Bus fare", amount: 90, note: "" },
	{ id: "s11", date: daysAgo(5), category: "workout", title: "Yoga", amount: 25, note: "" },
	{ id: "s12", date: daysAgo(6), category: "study", title: "CSS Flexbox", amount: 2.5, note: "" },
];

const DEFAULT_GOALS = [
	{ id: "g1", title: "Save Nu. 5,000 this month", target: 5000, current: 2300, unit: "Nu.", due: daysAgo(-20) },
	{ id: "g2", title: "Finish 20 coding exercises", target: 20, current: 12, unit: "exercises", due: daysAgo(-10) },
	{ id: "g3", title: "Run 50 km", target: 50, current: 18, unit: "km", due: daysAgo(-25) },
];
