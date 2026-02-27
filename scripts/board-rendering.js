/**
 * Generiert das HTML für eine Task-Karte
 * @param {Object} task - Das Task-Objekt
 * @returns {string} Das generierte HTML
 */
function generateTaskCardHtml(task) {
  const categoryClass = getCategoryClass(task.category);
  const categoryLabel = getCategoryLabel(task.category);
  const progressHtml = generateProgressHtml(task);
  const priorityIcon = getPriorityIcon(task.priority);
  const assigneesHtml = generateAssigneesHtml(task);
  return getTaskCardTemplate(
    task,
    categoryClass,
    categoryLabel,
    progressHtml,
    assigneesHtml,
    priorityIcon,
  );
}

/**
 * Gibt die CSS-Klasse für eine Kategorie zurück
 * @param {string} category - Die Kategorie
 * @returns {string} Die CSS-Klasse
 */
function getCategoryClass(category) {
  return category === "user-story"
    ? "category-user-story"
    : "category-technical";
}

/**
 * Gibt das Label für eine Kategorie zurück
 * @param {string} category - Die Kategorie
 * @returns {string} Das Kategorie-Label
 */
function getCategoryLabel(category) {
  return category === "user-story" ? "User Story" : "Technical Task";
}

/**
 * Generiert das HTML für den Fortschrittsbalken
 * @param {Object} task - Das Task-Objekt
 * @returns {string} Das HTML für den Fortschrittsbalken
 */
function generateProgressHtml(task) {
  if (task.subtasks && task.subtasks.length > 0) {
    const completed = countCompletedSubtasks(task.subtasks);
    const total = task.subtasks.length;
    return getProgressBarTemplate(completed, total);
  }
  return "";
}

/**
 * Zählt die abgeschlossenen Subtasks
 * @param {Array} subtasks - Array mit Subtasks
 * @returns {number} Anzahl der abgeschlossenen Subtasks
 */
function countCompletedSubtasks(subtasks) {
  let count = 0;
  for (let i = 0; i < subtasks.length; i++) {
    if (subtasks[i].completed) {
      count++;
    }
  }
  return count;
}

/**
 * Generiert das HTML für zugewiesene Benutzer
 * @param {Object} task - Das Task-Objekt
 * @returns {string} Das HTML für die Assignees
 */
function generateAssigneesHtml(task) {
  if (!task.assignedTo || !Array.isArray(task.assignedTo)) return "";
  let html = "";
  const displayCount = Math.min(task.assignedTo.length, 3);

  for (let i = 0; i < displayCount; i++) {
    const contactId = task.assignedTo[i];
    const contact = allContacts.find((c) => String(c.id) === String(contactId));
    if (contact) {
      const initials = getInitialsFromName(contact.name);
      html += getAssigneeBadgeTemplate(initials, contact.color);
    }
  }

  if (task.assignedTo.length > 3) {
    html += getAssigneeBadgeTemplate(
      `+${task.assignedTo.length - 3}`,
      "#2A3647",
    );
  }

  return html;
}

/**
 * Generiert das HTML für zugewiesene Kontakte in der Detailansicht
 * @param {Object} task - Das Task-Objekt
 * @returns {string} Das HTML mit Kontakt-Badges und Namen
 */
function buildAssignedToDetailsHtml(task) {
  if (
    !task.assignedTo ||
    !Array.isArray(task.assignedTo) ||
    task.assignedTo.length === 0
  ) {
    return "<span>No one</span>";
  }
  return buildAssigneeDetailItems(task.assignedTo);
}

/**
 * Baut die HTML-Einträge für alle zugewiesenen Kontakte
 * @param {Array} assignedIds - Array von Kontakt-IDs
 * @returns {string} Das HTML für alle Kontakt-Einträge
 */
function buildAssigneeDetailItems(assignedIds) {
  let html = "";
  for (let i = 0; i < assignedIds.length; i++) {
    const contact = allContacts.find(
      (c) => String(c.id) === String(assignedIds[i]),
    );
    if (contact) {
      const initials = getInitialsFromName(contact.name);
      html += getAssignedToDetailItemTemplate(
        initials,
        contact.color,
        contact.name,
      );
    }
  }
  return html || "<span>No one</span>";
}

/**
 * Gibt das Icon für eine Priorität zurück
 * @param {string} priority - Die Priorität
 * @returns {string} Das HTML für das Prioritäts-Icon
 */
function getPriorityIcon(priority) {
  if (priority === "urgent") {
    return getUrgentPriorityIcon();
  } else if (priority === "medium") {
    return getMediumPriorityIcon();
  } else {
    return getLowPriorityIcon();
  }
}

/**
 * Generiert das HTML für die Subtasks-Liste
 * @param {Object} task - Das Task-Objekt
 * @returns {string} Das HTML für die Subtasks
 */
function buildSubtasksHtml(task) {
  let subtasksHtml = "";
  for (let i = 0; i < task.subtasks.length; i++) {
    const st = task.subtasks[i];
    subtasksHtml += getSubtaskItemDetailTemplate(task.id, i, st);
  }
  return subtasksHtml;
}
