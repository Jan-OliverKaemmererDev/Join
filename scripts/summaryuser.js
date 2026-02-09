/**
 * summaryuser.js
 * Handles the summary page for logged-in users
 * Loads user-specific data from Local Storage
 */

/**
 * Initializes the summary page for logged-in users
 */
function initSummaryUser() {
  // Load current user data
  const currentUser = getCurrentUser();

  if (!currentUser) {
    // If no user, redirect to login
    window.location.href = "index.html";
    return;
  }

  // Update user-specific UI elements
  updateUserName(currentUser);
  updateUserInitials(currentUser);
  updateGreeting();
  updateTaskMetrics(currentUser);
}

/**
 * Updates the user name display
 * @param {Object} user - Current user object
 */
function updateUserName(user) {
  const userNameElement = document.getElementById("user-name");
  if (userNameElement) {
    userNameElement.textContent = user.name;
  }
}

/**
 * Updates the user initials in the header
 * @param {Object} user - Current user object
 */
function updateUserInitials(user) {
  const initialsElement = document.getElementById("user-initials");
  if (initialsElement) {
    const initials = getInitials(user.name);
    initialsElement.textContent = initials;
  }
}

/**
 * Gets initials from a full name
 * @param {string} name - Full name
 * @returns {string} Initials (max 2 characters)
 */
function getInitials(name) {
  const parts = name.trim().split(" ");

  if (parts.length === 1) {
    // Single name: take first 2 characters
    return parts[0].substring(0, 2).toUpperCase();
  } else {
    // Multiple names: take first letter of first and last name
    const firstInitial = parts[0].charAt(0);
    const lastInitial = parts[parts.length - 1].charAt(0);
    return (firstInitial + lastInitial).toUpperCase();
  }
}

/**
 * Updates the greeting based on time of day
 */
function updateGreeting() {
  const hour = new Date().getHours();
  let greeting = "Good evening,";

  if (hour < 12) {
    greeting = "Good morning,";
  } else if (hour < 18) {
    greeting = "Good afternoon,";
  }

  const greetingElement = document.getElementById("greeting-text");
  if (greetingElement) {
    greetingElement.textContent = greeting;
  }
}

/**
 * Updates all task metrics for the current user
 * @param {Object} user - Current user object
 */
function updateTaskMetrics(user) {
  // Get user's task data from Local Storage
  const userTasks = getUserTasks(user.id);

  // Calculate metrics
  const metrics = calculateTaskMetrics(userTasks);

  // Update UI
  document.getElementById("count-todo").textContent = metrics.todo;
  document.getElementById("count-done").textContent = metrics.done;
  document.getElementById("count-urgent").textContent = metrics.urgent;
  document.getElementById("count-board").textContent = metrics.board;
  document.getElementById("count-progress").textContent = metrics.progress;
  document.getElementById("count-awaiting").textContent = metrics.awaiting;

  // Update deadline
  const deadlineElement = document.getElementById("next-deadline");
  if (metrics.nextDeadline) {
    deadlineElement.textContent = metrics.nextDeadline;
  } else {
    deadlineElement.textContent = "No upcoming deadline";
  }
}

/**
 * Gets tasks for a specific user from Local Storage
 * @param {string} userId - User ID
 * @returns {Array} Array of task objects
 */
function getUserTasks(userId) {
  const tasksKey = `join_tasks_${userId}`;
  const tasksJson = localStorage.getItem(tasksKey);

  if (tasksJson) {
    return JSON.parse(tasksJson);
  }

  // Return empty array for new users
  return [];
}

/**
 * Calculates task metrics from task array
 * @param {Array} tasks - Array of task objects
 * @returns {Object} Metrics object
 */
function calculateTaskMetrics(tasks) {
  const metrics = {
    todo: 0,
    done: 0,
    urgent: 0,
    board: 0,
    progress: 0,
    awaiting: 0,
    nextDeadline: null,
  };

  // If no tasks, return zeros
  if (!tasks || tasks.length === 0) {
    return metrics;
  }

  let nearestDeadline = null;

  tasks.forEach((task) => {
    // Count by status
    switch (task.status) {
      case "todo":
        metrics.todo++;
        break;
      case "done":
        metrics.done++;
        break;
      case "inprogress":
        metrics.progress++;
        break;
      case "awaitfeedback":
        metrics.awaiting++;
        break;
    }

    // Count urgent tasks
    if (task.priority === "urgent") {
      metrics.urgent++;
    }

    // Track nearest deadline
    if (task.dueDate) {
      const taskDate = new Date(task.dueDate);
      if (!nearestDeadline || taskDate < new Date(nearestDeadline)) {
        nearestDeadline = task.dueDate;
      }
    }
  });

  // Total tasks in board (all tasks)
  metrics.board = tasks.length;

  // Format deadline
  if (nearestDeadline) {
    const date = new Date(nearestDeadline);
    const options = { year: "numeric", month: "long", day: "numeric" };
    metrics.nextDeadline = date.toLocaleDateString("en-US", options);
  }

  return metrics;
}

/**
 * Logs out the current user and redirects to login
 */
function logoutFromSummary() {
  logoutUser();
  window.location.href = "index.html";
}
