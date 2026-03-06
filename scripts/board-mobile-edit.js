let mobileEditTaskId = null;
let mobileEditSelectedContacts = [];
let mobileEditSubtasks = [];
let mobileEditSelectedPriority = "medium";

/**
 * Öffnet das mobile Edit-Overlay für einen Task
 * @param {number} taskId - Die ID des Tasks
 */
function openMobileEditOverlay(taskId) {
  const task = findTask(taskId);
  if (!task) return;
  mobileEditTaskId = taskId;

  fillMobileEditForm(task);
  document.getElementById("mobile-edit-overlay").classList.add("active");
  document.documentElement.classList.add("no-scroll");
  document.body.classList.add("no-scroll");
}

/**
 * Schließt das mobile Edit-Overlay
 */
function closeMobileEditOverlay() {
  document.getElementById("mobile-edit-overlay").classList.remove("active");
  document.documentElement.classList.remove("no-scroll");
  document.body.classList.remove("no-scroll");
  mobileEditTaskId = null;
  mobileEditSelectedContacts = [];
  mobileEditSubtasks = [];
}

/**
 * Füllt das mobile Edit-Formular mit Task-Daten
 * @param {Object} task - Das Task-Objekt
 */
function fillMobileEditForm(task) {
  document.getElementById("mobile-edit-title").value = task.title || "";
  document.getElementById("mobile-edit-description").value =
    task.description || "";
  document.getElementById("mobile-edit-due-date").value = task.dueDate || "";

  selectMobileEditPriority(task.priority || "medium");

  mobileEditSubtasks =
    task.subtasks && task.subtasks.length > 0
      ? JSON.parse(JSON.stringify(task.subtasks))
      : [];
  renderMobileEditSubtasks();

  mobileEditSelectedContacts = [];
  if (Array.isArray(task.assignedTo)) {
    task.assignedTo.forEach(function (id) {
      const contact = allContacts.find(function (c) {
        return String(c.id) === String(id);
      });
      if (contact) mobileEditSelectedContacts.push(contact);
    });
  }
  renderMobileEditAssignedToOptions();
  renderMobileEditSelectedInitials();
  validateMobileEditForm();
}

/**
 * Setzt die Priorität im mobilen Edit-Overlay
 */
function selectMobileEditPriority(priority) {
  mobileEditSelectedPriority = priority;
  const btns = document.querySelectorAll("#mobile-edit-overlay .priority-btn");
  btns.forEach(function (btn) {
    btn.classList.toggle("active", btn.dataset.priority === priority);
  });
}

/**
 * Rendert die Kontaktoptionen im mobilen Edit-Dropdown
 */
function renderMobileEditAssignedToOptions() {
  const container = document.getElementById("mobile-edit-assigned-to-options");
  if (!container) return;
  container.innerHTML = "";
  allContacts.forEach(function (contact) {
    const isSelected = mobileEditSelectedContacts.some(function (c) {
      return c.id === contact.id;
    });
    container.innerHTML += getMobileEditContactOptionTemplate(
      contact,
      isSelected,
    );
  });
}

/**
 * Gibt das Template für eine Kontaktoption zurück
 */
function getMobileEditContactOptionTemplate(contact, isSelected) {
  const selectedClass = isSelected ? "selected" : "";
  const nameSuffix = contact.isYou ? " (You)" : "";
  return `
    <div class="contact-option ${selectedClass}" onclick="toggleMobileEditContactSelection('${contact.id}', event)">
      <div class="contact-info">
        <div class="contact-avatar" style="background-color: ${contact.color}">${contact.initials}</div>
        <span class="contact-name">${contact.name}${nameSuffix}</span>
      </div>
      <div class="contact-checkbox"></div>
    </div>
  `;
}

/**
 * Schaltet die Auswahl eines Kontakts um
 */
function toggleMobileEditContactSelection(contactId, event) {
  event.stopPropagation();
  const contact = allContacts.find(function (c) {
    return c.id === contactId;
  });
  if (!contact) return;
  const index = mobileEditSelectedContacts.findIndex(function (c) {
    return c.id === contactId;
  });
  if (index > -1) {
    mobileEditSelectedContacts.splice(index, 1);
  } else {
    mobileEditSelectedContacts.push(contact);
  }
  renderMobileEditAssignedToOptions();
  renderMobileEditSelectedInitials();
}

/**
 * Rendert die Initialen der ausgewählten Kontakte
 */
function renderMobileEditSelectedInitials() {
  const container = document.getElementById(
    "mobile-edit-selected-contacts-initials",
  );
  if (!container) return;
  container.innerHTML = "";
  mobileEditSelectedContacts.forEach(function (contact) {
    container.innerHTML += `<div class="selected-avatar" style="background-color: ${contact.color}">${contact.initials}</div>`;
  });
}

/**
 * Schaltet das Assigned-To-Dropdown um
 */
function toggleMobileEditAssignedToDropdown() {
  const wrapper = document.getElementById("mobile-edit-assigned-to-wrapper");
  const options = document.getElementById("mobile-edit-assigned-to-options");
  wrapper.classList.toggle("open");
  options.classList.toggle("d-none");
}

// Dropdown schließen bei Klick außerhalb
document.addEventListener(
  "click",
  function (event) {
    const wrapper = document.getElementById("mobile-edit-assigned-to-wrapper");
    if (wrapper && !wrapper.contains(event.target)) {
      wrapper.classList.remove("open");
      const options = document.getElementById(
        "mobile-edit-assigned-to-options",
      );
      if (options) options.classList.add("d-none");
    }
  },
  true,
);

/**
 * Validiert das mobile Edit-Formular
 */
function validateMobileEditForm() {
  const title = document.getElementById("mobile-edit-title").value.trim();
  const dueDate = document.getElementById("mobile-edit-due-date").value;
  const btn = document.getElementById("mobile-edit-save-btn");
  if (btn) btn.disabled = !(title && dueDate);
}

/**
 * Zeigt die Subtask-Icons im mobilen Edit an
 */
function showMobileEditSubtaskIcons() {
  const icons = document.getElementById("mobile-edit-subtask-icons-active");
  if (icons) icons.classList.remove("v-hidden");
}

/**
 * Leert das Subtask-Eingabefeld im mobilen Edit
 */
function clearMobileEditSubtaskInput() {
  const input = document.getElementById("mobile-edit-subtask-input");
  if (input) {
    input.value = "";
    input.focus();
  }
}

/**
 * Fügt einen Subtask im mobilen Edit hinzu
 */
function addMobileEditSubtask() {
  const input = document.getElementById("mobile-edit-subtask-input");
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;
  const id = Date.now();
  mobileEditSubtasks.push({ id: id, text: text, completed: false });
  input.value = "";
  renderMobileEditSubtasks();
}

/**
 * Behandelt Keydown im Subtask-Input
 */
function handleMobileEditSubtaskKeydown(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    addMobileEditSubtask();
  }
  if (event.key === "Escape") {
    clearMobileEditSubtaskInput();
  }
}

/**
 * Rendert die Subtask-Liste im mobilen Edit
 */
function renderMobileEditSubtasks() {
  const list = document.getElementById("mobile-edit-subtask-list");
  if (!list) return;
  list.innerHTML = "";
  mobileEditSubtasks.forEach(function (subtask) {
    list.innerHTML += `
      <div class="subtask-item" id="mobile-edit-subtask-item-${subtask.id}">
        <div class="subtask-content"><span class="subtask-text">${subtask.text}</span></div>
        <div class="subtask-icons">
          <img src="./assets/icons/delete.svg" class="subtask-icon-small" onclick="removeMobileEditSubtask(${subtask.id})" alt="Delete">
        </div>
      </div>
    `;
  });
}

/**
 * Entfernt einen Subtask im mobilen Edit
 */
function removeMobileEditSubtask(id) {
  mobileEditSubtasks = mobileEditSubtasks.filter(function (s) {
    return s.id !== id;
  });
  renderMobileEditSubtasks();
}

/**
 * Speichert den bearbeiteten Task
 */
async function saveMobileEditTask() {
  if (!mobileEditTaskId) return;
  const taskIndex = findTaskById(mobileEditTaskId);
  if (taskIndex === -1) return;

  const task = tasks[taskIndex];
  task.title = document.getElementById("mobile-edit-title").value.trim();
  task.description = document
    .getElementById("mobile-edit-description")
    .value.trim();
  task.dueDate = document.getElementById("mobile-edit-due-date").value;
  task.priority = mobileEditSelectedPriority;
  task.assignedTo = mobileEditSelectedContacts.map(function (c) {
    return c.id;
  });
  task.subtasks = JSON.parse(JSON.stringify(mobileEditSubtasks));

  await saveSingleTask(task);
  renderTasks();
  closeMobileEditOverlay();
  closeTaskDetails();
  showToast("Task updated successfully");
}
