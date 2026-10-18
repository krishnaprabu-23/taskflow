const STORAGE_KEY = "taskflow-tasks";
const THEME_KEY = "taskflow-theme";

const form = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const prioritySelect = document.getElementById("priority-select");
const dueDateInput = document.getElementById("due-date");
const searchInput = document.getElementById("search-input");
const filterButtons = document.querySelectorAll(".filter-btn");
const taskList = document.getElementById("task-list");
const emptyMessage = document.getElementById("empty-message");
const taskCount = document.getElementById("task-count");
const clearCompletedBtn = document.getElementById("clear-completed");
const themeToggle = document.getElementById("theme-toggle");

let tasks = loadTasks();
let currentFilter = "all";
let searchTerm = "";

/* ---------- Storage ---------- */

function loadTasks() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch (error) {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

/* ---------- Task actions ---------- */

function addTask(text, priority, dueDate) {
  tasks.unshift({
    id: Date.now(),
    text: text,
    priority: priority,
    dueDate: dueDate,
    completed: false,
  });
  saveTasks();
  render();
}

function toggleTask(id) {
  const task = tasks.find((t) => t.id === id);
  if (task) {
    task.completed = !task.completed;
    saveTasks();
    render();
  }
}

function deleteTask(id) {
  tasks = tasks.filter((t) => t.id !== id);
  saveTasks();
  render();
}

function editTask(id) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;

  const newText = prompt("Edit task:", task.text);
  if (newText !== null && newText.trim() !== "") {
    task.text = newText.trim();
    saveTasks();
    render();
  }
}

function clearCompleted() {
  tasks = tasks.filter((t) => !t.completed);
  saveTasks();
  render();
}

/* ---------- Filtering ---------- */

function getVisibleTasks() {
  return tasks.filter((task) => {
    const matchesFilter =
      currentFilter === "all" ||
      (currentFilter === "active" && !task.completed) ||
      (currentFilter === "completed" && task.completed);

    const matchesSearch = task.text.toLowerCase().includes(searchTerm);

    return matchesFilter && matchesSearch;
  });
}

/* ---------- Rendering ---------- */

function createTaskElement(task) {
  const li = document.createElement("li");
  li.className = "task-item" + (task.completed ? " completed" : "");

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = task.completed;
  checkbox.addEventListener("change", () => toggleTask(task.id));

  const content = document.createElement("div");
  content.className = "task-content";

  const title = document.createElement("span");
  title.className = "task-title";
  title.textContent = task.text;

  const meta = document.createElement("div");
  meta.className = "task-meta";

  const badge = document.createElement("span");
  badge.className = "badge " + task.priority;
  badge.textContent = task.priority;
  meta.appendChild(badge);

  if (task.dueDate) {
    const due = document.createElement("span");
    const today = new Date().toLocaleDateString("en-CA");
    const isOverdue = !task.completed && task.dueDate < today;
    due.textContent = (isOverdue ? "Overdue: " : "Due: ") + task.dueDate;
    if (isOverdue) due.classList.add("overdue");
    meta.appendChild(due);
  }

  content.appendChild(title);
  content.appendChild(meta);

  const actions = document.createElement("div");
  actions.className = "task-actions";

  const editBtn = document.createElement("button");
  editBtn.textContent = "✏️";
  editBtn.setAttribute("aria-label", "Edit task");
  editBtn.addEventListener("click", () => editTask(task.id));

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "🗑️";
  deleteBtn.setAttribute("aria-label", "Delete task");
  deleteBtn.addEventListener("click", () => deleteTask(task.id));

  actions.appendChild(editBtn);
  actions.appendChild(deleteBtn);

  li.appendChild(checkbox);
  li.appendChild(content);
  li.appendChild(actions);

  return li;
}

function render() {
  taskList.innerHTML = "";

  const visibleTasks = getVisibleTasks();
  visibleTasks.forEach((task) => taskList.appendChild(createTaskElement(task)));

  emptyMessage.hidden = visibleTasks.length > 0;

  const remaining = tasks.filter((t) => !t.completed).length;
  taskCount.textContent = remaining + (remaining === 1 ? " task left" : " tasks left");
}

/* ---------- Theme ---------- */

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  themeToggle.textContent = theme === "dark" ? "☀️" : "🌙";
  localStorage.setItem(THEME_KEY, theme);
}

themeToggle.addEventListener("click", () => {
  const current = document.documentElement.dataset.theme;
  applyTheme(current === "dark" ? "light" : "dark");
});

/* ---------- Events ---------- */

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const text = taskInput.value.trim();
  if (text === "") return;

  addTask(text, prioritySelect.value, dueDateInput.value);

  form.reset();
  prioritySelect.value = "medium";
  taskInput.focus();
});

searchInput.addEventListener("input", (event) => {
  searchTerm = event.target.value.trim().toLowerCase();
  render();
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((b) => b.classList.remove("active"));
    button.classList.add("active");
    currentFilter = button.dataset.filter;
    render();
  });
});

clearCompletedBtn.addEventListener("click", clearCompleted);

/* ---------- Init ---------- */

applyTheme(localStorage.getItem(THEME_KEY) || "light");
render();