/**
 * board.js
 * Handles Board page functionality
 */

let tasks = [];
let currentDraggedTaskId = null;

/**
 * Initializes the board
 */
function initBoard() {
  loadTasks();
  renderTasks();
  checkUser();

  // Listen for task creation from the overlay
  window.addEventListener("taskAdded", () => {
    closeAddTaskOverlay();
    loadTasks();
    renderTasks();
  });
}

/**
 * Checks if user is logged in
 */
function checkUser() {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    // Redirect to login if no user
    window.location.href = "index.html";
    return;
  }
  if (document.getElementById("user-initials")) {
    updateHeaderInitials(currentUser);
  }
}

/**
 * Loads tasks from Local Storage
 */
function loadTasks() {
  const currentUser = getCurrentUser();
  if (!currentUser) return; // Should handle guest/no-user scenario

  const tasksKey = `join_tasks_${currentUser.id}`;
  const tasksJson = localStorage.getItem(tasksKey);
  if (tasksJson) {
    tasks = JSON.parse(tasksJson);
  } else {
    tasks = [];
  }
}

/**
 * Renders all tasks into their respective columns
 */
function renderTasks() {
  // Clear all columns
  document.getElementById("todo-list").innerHTML = "";
  document.getElementById("inprogress-list").innerHTML = "";
  document.getElementById("awaitfeedback-list").innerHTML = "";
  document.getElementById("done-list").innerHTML = "";

  // Check for empty tasks logic if needed (show "No tasks To do" etc.)
  let counts = {
    todo: 0,
    inprogress: 0,
    awaitfeedback: 0,
    done: 0,
  };

  tasks.forEach((task) => {
    const cardHtml = generateTaskCardHtml(task);
    const listId = `${task.status}-list`;
    const listElement = document.getElementById(listId);
    if (listElement) {
      listElement.innerHTML += cardHtml;
      counts[task.status]++;
    }
  });

  // Render "No tasks" placeholders if empty
  renderEmptyState("todo", counts.todo, "No tasks To do");
  renderEmptyState("inprogress", counts.inprogress, "No tasks In progress");
  renderEmptyState(
    "awaitfeedback",
    counts.awaitfeedback,
    "No tasks Await feedback",
  );
  renderEmptyState("done", counts.done, "No tasks Done");
}

function renderEmptyState(status, count, message) {
  const list = document.getElementById(`${status}-list`);
  if (count === 0 && list) {
    list.innerHTML = `<div class="no-tasks">${message}</div>`;
  }
}

/**
 * Generates HTML for a single task card
 * @param {Object} task
 */
function generateTaskCardHtml(task) {
  // Category styling
  const categoryClass =
    task.category === "user-story"
      ? "category-user-story"
      : "category-technical";
  const categoryLabel =
    task.category === "user-story" ? "User Story" : "Technical Task";

  // Progress Bar
  let progressHtml = "";
  if (task.subtasks && task.subtasks.length > 0) {
    const completed = task.subtasks.filter((st) => st.completed).length;
    const total = task.subtasks.length;
    const percent = (completed / total) * 100;
    progressHtml = `
        <div class="task-subtasks">
            <div class="progress-bar-container">
                <div class="progress-bar" style="width: ${percent}%"></div>
            </div>
            <span>${completed}/${total} Subtasks</span>
        </div>
      `;
  }

  // Priority Icon
  const priorityIcon = getPriorityIcon(task.priority);

  // Assignees
  // For demo, just showing initials of first assignee if exists (logic can be expanded)
  let assigneesHtml = "";
  if (task.assignedTo) {
    // In a real app we'd look up the user details. For now, let's just make a badge.
    // Assuming 'assignedTo' is a userId or list. The addtask.js saved a single string value?
    // checking addtask.js: assignedTo is value from select.
    assigneesHtml = `<div class="assignee-badge" style="background-color: #00bee8;">${getInitialsFromName(task.assignedTo || "U")}</div>`;
  }

  return `
    <div class="task-card" draggable="true" ondragstart="startDragging(${task.id})" onclick="openTaskDetails(${task.id})">
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

function getPriorityIcon(priority) {
  if (priority === "urgent") {
    return `<svg width="17" height="12" viewBox="0 0 17 12" fill="none"><path d="M8.5 0L0.5 12H16.5L8.5 0Z" fill="#FF3D00"/></svg>`;
  } else if (priority === "medium") {
    return `<svg width="17" height="12" viewBox="0 0 17 12" fill="none"><path d="M8.5 0L16.5 6L8.5 12L0.5 6L8.5 0Z" fill="#FFA800"/></svg>`; // Simplified representation? No, let's use the lines from addtask
    // Actually for medium it's usually the equals sign. Let's use simple SVG for now or the one from addtask is fine but I don't have it as an asset here.
    // I will use a simple color placeholder or svg.
    return `<span style="color: #FFA800; font-weight: bold;">=</span>`;
  } else {
    return `<svg width="17" height="12" viewBox="0 0 17 12" fill="none"><path d="M8.5 12L16.5 0H0.5L8.5 12Z" fill="#7AE229"/></svg>`;
  }
}

/* Drag and Drop */
function startDragging(id) {
  currentDraggedTaskId = id;
}

function allowDrop(ev) {
  ev.preventDefault();
}

/**
 * Highlight droppable area
 */
function highlight(id) {
  document.getElementById(id).classList.add("drag-over");
}

function removeHighlight(id) {
  document.getElementById(id).classList.remove("drag-over");
}

function moveTo(status) {
  const taskIndex = tasks.findIndex((t) => t.id === currentDraggedTaskId);
  if (taskIndex !== -1) {
    tasks[taskIndex].status = status;
    saveTasks();
    renderTasks();
  }
  currentDraggedTaskId = null;
}

function drop(ev, status) {
  ev.preventDefault();
  removeHighlight(`${status}-list`);
  moveTo(status);
}

function saveTasks() {
  const currentUser = getCurrentUser();
  if (!currentUser) return;
  const tasksKey = `join_tasks_${currentUser.id}`;
  localStorage.setItem(tasksKey, JSON.stringify(tasks));
}

/* Add Task Overlay */
function openAddTaskOverlay() {
  document.getElementById("add-task-overlay").classList.add("active");
  // We might need to inject the add task form here or it's static in HTML
}

function closeAddTaskOverlay() {
  document.getElementById("add-task-overlay").classList.remove("active");
}

// Override the handleAddTask from addtask.js if called from board to close overlay and refresh
// But addtask.js functions are global. We can rely on the alert and then maybe we need a callback.
// For now, let's modify how we handle the form submit or listen to it.
// Actually, simpler: The Add Task form in the overlay is just the same form.
// checking addtask.js: it does window.location.href or alert.
// We should probably modify addtask.js to handle "embedded" mode, or just reload board.

/* Task Details Overlay */
function openTaskDetails(taskId) {
  const task = tasks.find((t) => t.id === taskId);
  if (!task) return;

  const content = document.getElementById("task-details-content");

  // Date formatting
  const date = new Date(task.dueDate).toLocaleDateString("de-DE"); // or keep as is

  // Subtasks html
  let subtasksHtml = "";
  task.subtasks.forEach((st, index) => {
    subtasksHtml += `
            <div class="subtask-item-detail">
                <input type="checkbox" ${st.completed ? "checked" : ""} onchange="toggleSubtask(${task.id}, ${index})">
                <span>${st.text}</span>
            </div>
        `;
  });

  content.innerHTML = `
        <div class="task-details-header">
            <div class="category-tag ${task.category === "user-story" ? "category-user-story" : "category-technical"}">${task.category === "user-story" ? "User Story" : "Technical Task"}</div>
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
                ${getPriorityIcon(task.priority)}
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
             <button style="border: none; background: transparent; cursor: pointer; display: flex; align-items: center; gap: 5px;">
                <svg width="19" height="19" viewBox="0 0 19 19" fill="none"><path d="M2 19C1.45 19 0.979167 18.8042 0.5875 18.4125C0.195833 18.0208 0 17.55 0 17V14.125C0 13.9917 0.025 13.8667 0.075 13.75C0.125 13.6333 0.2 13.5333 0.3 13.45L12.8 0.95C13 0.75 13.2042 0.604167 13.4125 0.5125C13.6208 0.420833 13.8417 0.375 14.075 0.375C14.3083 0.375 14.5333 0.420833 14.75 0.5125C14.9667 0.604167 15.175 0.75 15.375 0.95L18.05 3.625C18.25 3.825 18.3958 4.03333 18.4875 4.25C18.5792 4.46667 18.625 4.69167 18.625 4.925C18.625 5.15833 18.5792 5.37917 18.4875 5.5875C18.3958 5.79583 18.25 6.00833 18.05 6.225L5.55 18.725C5.46667 18.825 5.3625 18.9 5.2375 18.95C5.1125 19 4.975 19.025 4.825 19.025H2ZM15.375 6.3 12.7 3.625L15.375 6.3ZM4.25 17H4.95L14.725 7.225L14.025 6.525L4.25 16.3V17ZM12.7 3.625L15.375 6.3L12.7 3.625Z" fill="#2A3647"/></svg>
                Edit
             </button>
        </div>    
    `;

  document.getElementById("task-details-overlay").classList.add("active");
}

function closeTaskDetails() {
  document.getElementById("task-details-overlay").classList.remove("active");
}

function toggleSubtask(taskId, subtaskIndex) {
  const task = tasks.find((t) => t.id === taskId);
  if (task) {
    task.subtasks[subtaskIndex].completed =
      !task.subtasks[subtaskIndex].completed;
    saveTasks();
    renderTasks(); // Refresh board card (progress bar)
    // Note: keeping the detail view open, no need to re-render it fully, but if we wanted to reflect changes there we might need to.
    // user didn't ask for full interactivity but checkboxes are implied by subtasks
  }
}

function deleteTask(taskId) {
  tasks = tasks.filter((t) => t.id !== taskId);
  saveTasks();
  renderTasks();
  closeTaskDetails();
}

/**
 * Filter tasks by title or description
 */
function searchTasks() {
  const query = document.getElementById("search-input").value.toLowerCase();

  // Simple filter on the DOM is sometimes easier, but since we re-render from 'tasks' array, we might want to just filter what we render.
  // However, we should preserve the original 'tasks' array.

  // Better strategy: Modify renderTasks to accept a filter.
  // But for quick implementation, let's just loop through cards and hide/show.

  const cards = document.querySelectorAll(".task-card");
  cards.forEach((card) => {
    const title = card.querySelector(".task-title").innerText.toLowerCase();
    const desc = card
      .querySelector(".task-description")
      .innerText.toLowerCase();
    if (title.includes(query) || desc.includes(query)) {
      card.style.display = "flex";
    } else {
      card.style.display = "none";
    }
  });
}
