const form = document.querySelector(".registration-form");
const formMessage = document.querySelector(".form-message");

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
