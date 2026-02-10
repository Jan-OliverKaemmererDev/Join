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
