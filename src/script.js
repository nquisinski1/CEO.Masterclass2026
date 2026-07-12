const countdown = document.querySelector(".countdown strong");
const form = document.querySelector(".form");

function updateCountdown() {
  if (!countdown) return;

  const deadline = document.querySelector(".countdown")?.dataset.deadline;
  if (!deadline) {
    countdown.textContent = "-- : -- : --";
    return;
  }

  const diff = new Date(deadline).getTime() - Date.now();
  if (diff <= 0) {
    countdown.textContent = "ao vivo";
    return;
  }

  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);

  countdown.textContent = `${String(days).padStart(2, "0")}d : ${String(hours).padStart(2, "0")}h : ${String(minutes).padStart(2, "0")}m`;
}

if (form) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const button = form.querySelector("button");
    if (button) button.textContent = "Registro recebido";
  });
}

updateCountdown();
setInterval(updateCountdown, 60000);
