/**
 * Generiert das HTML-Template für eine Task-Karte
 * @param {Object} task - Das Task-Objekt
 * @param {string} categoryClass - Die CSS-Klasse für die Kategorie
 * @param {string} categoryLabel - Das Label für die Kategorie
 * @param {string} progressHtml - Das HTML für den Fortschrittsbalken
 * @param {string} assigneesHtml - Das HTML für die zugewiesenen Benutzer
 * @param {string} priorityIcon - Das HTML für das Prioritäts-Icon
 * @returns {string} Das HTML-Template für die Task-Karte
 */
function getTaskCardTemplate(task, categoryClass, categoryLabel, progressHtml, assigneesHtml, priorityIcon) {
  return `
    <div class="task-card" draggable="true" data-task-id="${task.id}" ondragstart="startDragging(${task.id}, event)" ondragend="endDragging()" onclick="openTaskDetails(${task.id})">
      <div class="category-tag ${categoryClass}">${categoryLabel}</div>
      <h3 class="task-title">${task.title}</h3>
      <p class="task-description">${task.description}</p>
      ${progressHtml}
      <div class="task-footer">
        <div class="task-assignees">
          ${assigneesHtml}
        </div>
        <div class="task-priority">
          ${priorityIcon}
        </div>
      </div>
    </div>
  `;
}


/**
 * Generiert das HTML-Template für einen Fortschrittsbalken
 * @param {number} completed - Anzahl der abgeschlossenen Subtasks
 * @param {number} total - Gesamtanzahl der Subtasks
 * @returns {string} Das HTML-Template für den Fortschrittsbalken
 */
function getProgressBarTemplate(completed, total) {
  const percent = (completed / total) * 100;
  return `
    <div class="task-subtasks">
      <div class="progress-bar-container">
        <div class="progress-bar" style="width: ${percent}%"></div>
      </div>
      <span>${completed}/${total} Subtasks</span>
    </div>
  `;
}


/**
 * Generiert das HTML-Template für ein Assignee-Badge
 * @param {string} initials - Die Initialen des Assignees
 * @returns {string} Das HTML-Template für das Assignee-Badge
 */
function getAssigneeBadgeTemplate(initials) {
  return `<div class="assignee-badge" style="background-color: #00bee8;">${initials}</div>`;
}


/**
 * Generiert das HTML-Template für fehlende Tasks
 * @param {string} message - Die anzuzeigende Nachricht
 * @returns {string} Das HTML-Template für die Fehlmeldung
 */
function getNoTasksTemplate(message) {
  return `<div class="no-tasks">${message}</div>`;
}


/**
 * Generiert das HTML-Template für ein Subtask-Element in der Detailansicht
 * @param {number} taskId - Die ID des Tasks
 * @param {number} index - Der Index des Subtasks
 * @param {Object} st - Das Subtask-Objekt
 * @returns {string} Das HTML-Template für das Subtask-Element
 */
function getSubtaskItemDetailTemplate(taskId, index, st) {
  return `
    <div class="subtask-item-detail">
      <input type="checkbox" ${st.completed ? "checked" : ""} onchange="toggleSubtask(${taskId}, ${index})">
      <span>${st.text}</span>
    </div>
  `;
}


/**
 * Generiert das HTML-Template für die Task-Detailansicht
 * @param {Object} task - Das Task-Objekt
 * @param {string} subtasksHtml - Das HTML für die Subtasks
 * @param {string} priorityIcon - Das HTML für das Prioritäts-Icon
 * @param {string} categoryClass - Die CSS-Klasse für die Kategorie
 * @param {string} categoryLabel - Das Label für die Kategorie
 * @returns {string} Das HTML-Template für die Task-Details
 */
function getTaskDetailsTemplate(task, subtasksHtml, priorityIcon, categoryClass, categoryLabel) {
  return `
    <div class="task-details-header">
      <div class="category-tag ${categoryClass}">${categoryLabel}</div>
      <button class="task-details-close" onclick="closeTaskDetails()">&times;</button>
    </div>
    <h1 class="task-details-title">${task.title}</h1>
    <p class="task-description" style="-webkit-line-clamp: unset;">${task.description}</p>
    <div class="task-details-info">
      <span class="task-details-label">Due date:</span>
      <span>${task.dueDate}</span>
    </div>
    <div class="task-details-info">
      <span class="task-details-label">Priority:</span>
      <div class="task-details-priority">
        <span>${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</span>
        ${priorityIcon}
      </div>
    </div>
    <div class="task-details-info" style="flex-direction: column; align-items: flex-start;">
      <span class="task-details-label">Assigned To:</span>
      <div style="margin-top: 10px;">${task.assignedTo || "No one"}</div>
    </div>
    <div class="subtasks-section">
      <p style="font-weight: 700;">Subtasks</p>
      <div class="subtasks-list-details">
        ${subtasksHtml}
      </div>
    </div>
    <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
      <button onclick="deleteTask(${task.id})" style="border: none; background: transparent; cursor: pointer; display: flex; align-items: center; gap: 5px;">
        <svg width="16" height="18" viewBox="0 0 16 18" fill="none"><path d="M3 18C2.45 18 1.97917 17.8042 1.5875 17.4125C1.19583 17.0208 1 16.55 1 16V3H0V1H5V0H11V1H16V3H15V16C15 16.55 14.8042 17.0208 14.4125 17.4125C14.0208 17.8042 13.55 18 13 18H3ZM13 3H3V16H13V3ZM5 14H7V5H5V14ZM9 14H11V5H9V14Z" fill="#2A3647"/></svg>
        Delete
      </button>
      <button onclick="editTask(${task.id})" style="border: none; background: transparent; cursor: pointer; display: flex; align-items: center; gap: 5px;">
        <svg width="19" height="19" viewBox="0 0 19 19" fill="none"><path d="M2 19C1.45 19 0.979167 18.8042 0.5875 18.4125C0.195833 18.0208 0 17.55 0 17V14.125C0 13.9917 0.025 13.8667 0.075 13.75C0.125 13.6333 0.2 13.5333 0.3 13.45L12.8 0.95C13 0.75 13.2042 0.604167 13.4125 0.5125C13.6208 0.420833 13.8417 0.375 14.075 0.375C14.3083 0.375 14.5333 0.420833 14.75 0.5125C14.9667 0.604167 15.175 0.75 15.375 0.95L18.05 3.625C18.25 3.825 18.3958 4.03333 18.4875 4.25C18.5792 4.46667 18.625 4.69167 18.625 4.925C18.625 5.15833 18.5792 5.37917 18.4875 5.5875C18.3958 5.79583 18.25 6.00833 18.05 6.225L5.55 18.725C5.46667 18.825 5.3625 18.9 5.2375 18.95C5.1125 19 4.975 19.025 4.825 19.025H2ZM15.375 6.3 12.7 3.625L15.375 6.3ZM4.25 17H4.95L14.725 7.225L14.025 6.525L4.25 16.3V17ZM12.7 3.625L15.375 6.3L12.7 3.625Z" fill="#2A3647"/></svg>
        Edit
      </button>
    </div>
  `;
}


/**
 * Generiert das HTML-Icon für hohe Priorität
 * @returns {string} Das HTML für das Urgent-Icon
 */
function getUrgentPriorityIcon() {
  return `<svg width="17" height="12" viewBox="0 0 17 12" fill="none"><path d="M8.5 0L0.5 12H16.5L8.5 0Z" fill="#FF3D00"/></svg>`;
}


/**
 * Generiert das HTML-Icon für mittlere Priorität
 * @returns {string} Das HTML für das Medium-Icon
 */
function getMediumPriorityIcon() {
  return `<span style="color: #FFA800; font-weight: bold;">=</span>`;
}


/**
 * Generiert das HTML-Icon für niedrige Priorität
 * @returns {string} Das HTML für das Low-Icon
 */
function getLowPriorityIcon() {
  return `<svg width="17" height="12" viewBox="0 0 17 12" fill="none"><path d="M8.5 12L16.5 0H0.5L8.5 12Z" fill="#7AE229"/></svg>`;
}
