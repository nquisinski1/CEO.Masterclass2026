const form = document.querySelector(".registration-form");
const formMessage = document.querySelector(".form-message");
const videoDialog = document.querySelector(".video-dialog");
const videoOpeners = document.querySelectorAll("[data-open-video]");
const videoClosers = document.querySelectorAll("[data-close-video]");

videoOpeners.forEach((button) => {
  button.addEventListener("click", () => {
    if (videoDialog && typeof videoDialog.showModal === "function") {
      videoDialog.showModal();
    }
  });
});

videoClosers.forEach((button) => {
  button.addEventListener("click", () => videoDialog?.close());
});

videoDialog?.addEventListener("click", (event) => {
  if (event.target === videoDialog) videoDialog.close();
});

form?.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!form.checkValidity()) {
    form.reportValidity();
    if (formMessage) formMessage.textContent = "Completa los campos obligatorios para revisar el flujo.";
    return;
  }

  const submitButton = form.querySelector("button[type='submit']");
  if (submitButton) submitButton.textContent = "Interés registrado";
  if (formMessage) {
    formMessage.textContent = "Flujo de revisión concluido. Ningún dato fue enviado.";
  }
});
