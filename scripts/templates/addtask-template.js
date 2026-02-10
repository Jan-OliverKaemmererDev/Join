function getSubtaskItemTemplate(subtask) {
  return `
    <li class="subtask-item">
      <span>${subtask.text}</span>
      <button type="button" onclick="removeSubtask(${subtask.id})">×</button>
    </li>
  `;
}

function getToastTemplate(message) {
  return `
    <span>${message}</span>
    <img src="./assets/summary-page/board-icon.svg" style="filter: brightness(0) invert(1); margin-left: 20px;" alt="">
  `;
}
