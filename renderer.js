const input = document.getElementById("taskInput");
const dateInput = document.getElementById("taskDeadline");
const addBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");
const toggleModeBtn = document.getElementById("toggleMode");
const versionEl = document.getElementById("version");
const searchInput = document.getElementById("searchInput");
const taskCount = document.getElementById("taskCount");
const clearAllBtn = document.getElementById("clearAllBtn");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function renderTasks() {
    const keyword = searchInput.value.toLowerCase();
    taskList.innerHTML = "";

    const filteredTasks = tasks.filter((t) => t.text.toLowerCase().includes(keyword));

    filteredTasks.forEach((task, index) => {
        const li = document.createElement("li");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.done;
        checkbox.addEventListener("change", () => {
            task.done = checkbox.checked;
            saveTasks();
            renderTasks();
        });

        const span = document.createElement("span");
        span.textContent = `${task.text} (Hạn: ${task.deadline || "Không"})`;
        span.contentEditable = false;
        span.className = task.done ? "done task-text" : "task-text";

        const editBtn = document.createElement("button");
        editBtn.textContent = "✏️";
        editBtn.addEventListener("click", () => {
            span.contentEditable = true;
            span.focus();
        });

        span.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                span.contentEditable = false;
                const parts = span.textContent.split(" (Hạn:");
                task.text = parts[0].trim();
                saveTasks();
                renderTasks();
            }
        });

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "❌";
        deleteBtn.addEventListener("click", () => {
            tasks.splice(index, 1);
            saveTasks();
            renderTasks();
        });

        li.appendChild(checkbox);
        li.appendChild(span);
        li.appendChild(editBtn);
        li.appendChild(deleteBtn);
        taskList.appendChild(li);
    });

    taskCount.textContent = tasks.length;
}

addBtn.addEventListener("click", () => {
    const text = input.value.trim();
    const deadline = dateInput.value;
    if (text) {
        tasks.push({ text, deadline, done: false });
        saveTasks();
        renderTasks();
        input.value = "";
        dateInput.value = "";
    }
});

toggleModeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark");
});

searchInput.addEventListener("input", renderTasks);

clearAllBtn.addEventListener("click", () => {
    if (confirm("Xóa tất cả công việc?")) {
        tasks = [];
        saveTasks();
        renderTasks();
    }
});

window.addEventListener("DOMContentLoaded", () => {
    renderTasks();
    Notification.requestPermission();
    window.electronAPI.getAppVersion().then((v) => {
        versionEl.textContent = v;
    });
});

function checkUpcomingTasks() {
    const now = new Date();
    const oneDayLater = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    tasks.forEach(task => {
        if (
            !task.done &&
            task.deadline &&
            new Date(task.deadline) <= oneDayLater &&
            new Date(task.deadline) > now
        ) {
            new Notification("📅 Sắp đến hạn!", {
                body: `📝 ${task.text} - Hạn: ${task.deadline}`
            });
        }
    });
}

setInterval(checkUpcomingTasks, 60 * 1000);
checkUpcomingTasks();