// Druk Brew Café — Oct 29 sprint

/* Form validation + success message (contact & reservation) */
document.querySelectorAll(".needs-validation").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      form.querySelector(":invalid")?.focus();
      return;
    }

    const success = document.querySelector(form.dataset.success);
    if (success?.classList.contains("modal")) {
      bootstrap.Modal.getOrCreateInstance(success).show();
    } else if (success) {
      success.classList.remove("d-none");
    }

    form.reset();
    form.classList.remove("was-validated");
    form.dispatchEvent(new Event("change"));
  });
});

/* Menu filter pills */
document.querySelectorAll("[data-filter-group]").forEach((group) => {
  const items = document.querySelectorAll(`${group.dataset.filterGroup} [data-category]`);

  group.addEventListener("click", (event) => {
    const button = event.target.closest("[data-filter]");
    if (!button) return;

    group.querySelectorAll("[data-filter]").forEach((pill) => {
      pill.classList.toggle("active", pill === button);
      pill.setAttribute("aria-pressed", pill === button);
    });

    items.forEach((item) => {
      const show = button.dataset.filter === "all" || item.dataset.category === button.dataset.filter;
      item.classList.toggle("d-none", !show);
    });
  });
});

/* Dates can't be in the past */
document.querySelectorAll("input[type=date][data-min-today]").forEach((input) => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  input.min = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
});

/* Reservation summary */
const reserveForm = document.querySelector("#reserveForm");

if (reserveForm) {
  const params = new URLSearchParams(window.location.search);
  const { seating, date, guests, preorder } = reserveForm.elements;

  if (params.has("seating") && seating.querySelector(`option[value="${params.get("seating")}"]`)) {
    seating.value = params.get("seating");
  }
  if (params.has("date")) date.value = params.get("date");
  if (params.has("guests")) guests.value = params.get("guests");

  const summary = (key) => document.querySelector(`[data-summary="${key}"]`);

  const updateSummary = () => {
    const option = seating.selectedOptions[0];
    const time = reserveForm.querySelector("input[name=time]:checked");
    const people = Number(guests.value) || 0;
    const fee = Number(option?.dataset.fee || 0);
    const preorderOption = preorder.selectedOptions[0];
    const preorderPrice = Number(preorderOption?.dataset.price || 0) * people;

    summary("seating").textContent = option?.value ? option.text : "—";
    summary("date").textContent = date.value
      ? new Date(`${date.value}T00:00`).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" })
      : "—";
    summary("time").textContent = time ? time.value : "—";
    summary("guests").textContent = people ? `${people} ${people === 1 ? "guest" : "guests"}` : "—";
    summary("preorder").textContent = preorderPrice ? `Nu. ${preorderPrice.toLocaleString()}` : "None";
    summary("total").textContent = `Nu. ${(fee + preorderPrice).toLocaleString()}`;
  };

  reserveForm.addEventListener("change", updateSummary);
  reserveForm.addEventListener("input", updateSummary);
  updateSummary();
}

/* Footer year */
document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
