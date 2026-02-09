/**
 * addtask.js
 * Handles Add Task page functionality
 */

let selectedPriority = "medium"; // Default priority
let subtasks = [];

/**
 * Initializes the Add Task page
 */
function initAddTask() {
  // Load current user and update UI
  const currentUser = getCurrentUser();

  if (!currentUser) {
    // Redirect to login if no user
    window.location.href = "index.html";
    return;
  }

  // Update user initials in header
  updateHeaderInitials(currentUser);

  // Set minimum date to today
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("due-date").setAttribute("min", today);

  // Initialize form validation
  validateForm();
}

/**
 * Updates user initials in the header
 * @param {Object} user - Current user object
 */
function updateHeaderInitials(user) {
  const initialsElement = document.getElementById("user-initials");
  if (initialsElement) {
    const initials = getInitialsFromName(user.name);
    initialsElement.textContent = initials;
  }
}

/**
 * Gets initials from name
 * @param {string} name - Full name
 * @returns {string} Initials
 */
function getInitialsFromName(name) {
  const parts = name.trim().split(" ");
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Selects a priority level
 * @param {string} priority - Priority level (urgent, medium, low)
 */
function selectPriority(priority) {
  // Remove active class from all buttons
  const buttons = document.querySelectorAll(".priority-btn");
  buttons.forEach((btn) => btn.classList.remove("active"));

  // Add active class to selected button
  const selectedBtn = document.querySelector(`[data-priority="${priority}"]`);
  if (selectedBtn) {
    selectedBtn.classList.add("active");
    selectedPriority = priority;
  }
}

/**
 * Adds a new subtask to the list
 */
function addSubtask() {
  const input = document.getElementById("subtask-input");
  const subtaskText = input.value.trim();

  if (subtaskText === "") {
    return;
  }

  // Add to subtasks array
  const subtask = {
    id: Date.now(),
    text: subtaskText,
    completed: false,
  };

  subtasks.push(subtask);

  // Clear input
  input.value = "";

  // Render subtasks
  renderSubtasks();
}

/**
 * Renders all subtasks in the list
 */
function renderSubtasks() {
  const list = document.getElementById("subtask-list");
  list.innerHTML = "";

  subtasks.forEach((subtask) => {
    const li = document.createElement("li");
    li.className = "subtask-item";
    li.innerHTML = `
      <span>${subtask.text}</span>
      <button type="button" onclick="removeSubtask(${subtask.id})">×</button>
    `;
    list.appendChild(li);
  });
}

/**
 * Removes a subtask from the list
 * @param {number} id - Subtask ID
 */
function removeSubtask(id) {
  subtasks = subtasks.filter((st) => st.id !== id);
  renderSubtasks();
}

/**
 * Validates the form and enables/disables submit button
 */
function validateForm() {
  const title = document.getElementById("title").value.trim();
  const dueDate = document.getElementById("due-date").value;
  const category = document.getElementById("category").value;

  const submitBtn = document.getElementById("create-task-btn");

  // Enable button only if required fields are filled
  if (title && dueDate && category) {
    submitBtn.disabled = false;
  } else {
    submitBtn.disabled = true;
  }
}

/**
 * Handles task creation form submission
 * @param {Event} event - Form submit event
 */
function handleAddTask(event) {
  event.preventDefault();

  // Get current user
  const currentUser = getCurrentUser();
  if (!currentUser) {
    alert("Please log in to create tasks");
    return;
  }

  // Collect form data
  const task = {
    id: Date.now(),
    title: document.getElementById("title").value.trim(),
    description: document.getElementById("description").value.trim(),
    dueDate: document.getElementById("due-date").value,
    priority: selectedPriority,
    assignedTo: document.getElementById("assigned-to").value,
    category: document.getElementById("category").value,
    subtasks: [...subtasks],
    status: "todo",
    createdAt: new Date().toISOString(),
    createdBy: currentUser.id,
  };

  // Save task to Local Storage
  saveTask(currentUser.id, task);

  // Show success message via Toast
  showToast("Task added to board");

  // Dispatch event for other scripts (e.g. board.js)
  window.dispatchEvent(
    new CustomEvent("taskAdded", { detail: { task: task } }),
  );

  // Clear form
  clearForm();

  // If we are on addtask.html (not board overlay), we might want to redirect after delay
  // But for now, just clear and show toast as per requirements.
}

/**
 * Saves a task to Local Storage
 * @param {string} userId - User ID
 * @param {Object} task - Task object
 */
function saveTask(userId, task) {
  const tasksKey = `join_tasks_${userId}`;

  // Get existing tasks
  let tasks = [];
  const tasksJson = localStorage.getItem(tasksKey);
  if (tasksJson) {
    tasks = JSON.parse(tasksJson);
  }

  // Add new task
  tasks.push(task);

  // Save back to Local Storage
  localStorage.setItem(tasksKey, JSON.stringify(tasks));

  console.log("Task saved:", task);
}

/**
 * Clears the form and resets all fields
 */
function clearForm() {
  // Reset form
  const form = document.getElementById("add-task-form");
  if (form) form.reset();

  // Reset priority to medium
  selectPriority("medium");

  // Clear subtasks
  subtasks = [];
  renderSubtasks();

  // Revalidate form
  validateForm();
}

/**
 * Shows a toast message
 * @param {string} message
 */
function showToast(message) {
  let toast = document.getElementById("toast-message");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast-message";
    toast.className = "toast-message d-none";
    document.body.appendChild(toast);
  }

  // Add icon if needed, for now just text or innerHTML used in style.css?
  // style.css doesn't show inner content structure, just container.
  // The image shows an icon. I'll add the icon from assets if possible, or just text.
  // Image: "Task added to board" [Icon]
  // I'll use the board icon or similar.

  toast.innerHTML = `
        <span>${message}</span>
        <img src="./assets/summary-page/board-icon.svg" style="filter: brightness(0) invert(1); margin-left: 20px;" alt="">
    `;

  toast.style.display = "flex";
  toast.style.alignItems = "center";

  // Remove d-none to slide up (transition handled by css check)
  // CSS: .toast-message:not(.d-none) { bottom: 75%; }
  // CSS: .d-none { display: none; }

  // First remove d-none but keep it below screen if CSS allows?
  // Actually the CSS .toast-message starts at bottom: -100px.
  // .toast-message:not(.d-none) -> bottom: 75%?? That puts it very high.
  // Maybe bottom: 50%? Or top?
  // The image shows it "mittig oben" (center top) or center?
  // "mittig oben ein alert erscheinen". -> "Top center".
  // transform: translateX(-50%); already centers horizontally.
  // I should check style.css again.

  toast.classList.remove("d-none");

  setTimeout(() => {
    toast.classList.add("d-none");
  }, 3000);
}
