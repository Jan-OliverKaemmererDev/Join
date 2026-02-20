/**
 * Generiert das HTML-Template für ein Subtask-Element
 * @param {Object} subtask - Das Subtask-Objekt mit id und text
 * @returns {string} Das HTML-Template für das Subtask-Element
 */
function getSubtaskItemTemplate(subtask) {
  return `
    <li class="subtask-item">
      <span>${subtask.text}</span>
      <button type="button" onclick="removeSubtask(${subtask.id})">×</button>
    </li>
  `;
}

/**
 * Generiert das HTML-Template für eine Kontakt-Option im Dropdown
 * @param {Object} contact - Das Kontakt-Objekt
 * @param {boolean} isSelected - Ob der Kontakt ausgewählt ist
 * @returns {string} Das HTML-Template für die Kontakt-Option
 */
function getContactOptionTemplate(contact, isSelected) {
  const selectedClass = isSelected ? "selected" : "";
  const nameSuffix = contact.isYou ? " (You)" : "";

  return `
    <div class="contact-option ${selectedClass}" onclick="toggleContactSelection('${contact.id}', event)">
      <div class="contact-info">
        <div class="contact-avatar" style="background-color: ${contact.color}">
          ${contact.initials}
        </div>
        <span class="contact-name">${contact.name}${nameSuffix}</span>
      </div>
      <div class="contact-checkbox"></div>
    </div>
  `;
}

/**
 * Generiert das HTML-Template für die Initialen einer ausgewählten Person
 * @param {Object} contact - Das Kontakt-Objekt
 * @returns {string} Das HTML-Template für den Initialen-Kreis
 */
function getSelectedContactInitialsTemplate(contact) {
  return `
    <div class="selected-avatar" style="background-color: ${contact.color}">
      ${contact.initials}
    </div>
  `;
}

/**
 * Generiert das HTML-Template für eine Toast-Nachricht
 * @param {string} message - Die anzuzeigende Nachricht
 * @returns {string} Das HTML-Template für die Toast-Nachricht
 */
function getToastTemplate(message) {
  return `
    <span>${message}</span>
    <img src="./assets/summary-page/board-icon.svg" style="filter: brightness(0) invert(1); margin-left: 20px;" alt="">
  `;
}
