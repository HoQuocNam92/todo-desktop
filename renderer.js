const input = document.getElementById("taskInput");
const dateInput = document.getElementById("taskDeadline");
const timeInput = document.getElementById("taskTime");
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

    const filteredTasks = tasks.filter(t => t.text.toLowerCase().includes(keyword));

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
        span.textContent = `${task.text} (Hạn: ${task.deadline || "Không"}${task.time ? " " + task.time : ""})`;
        span.className = task.done ? "done task-text" : "task-text";
        span.contentEditable = false;

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

        span.addEventListener("blur", () => {
            const parts = span.textContent.split(" (Hạn:");
            if (parts[0].trim() !== task.text) {
                task.text = parts[0].trim();
                saveTasks();
                renderTasks();
            }
            span.contentEditable = false;
        });

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "❌";
        deleteBtn.addEventListener("click", () => {
            tasks.splice(index, 1);
            saveTasks();
            renderTasks();
        });

        li.className = "task-item";
        li.appendChild(checkbox);
        li.appendChild(span);
        li.appendChild(editBtn);
        li.appendChild(deleteBtn);

        taskList.appendChild(li);
    });

    taskCount.textContent = filteredTasks.length;
}

addBtn.addEventListener("click", () => {
    const text = input.value.trim();
    const deadline = dateInput.value;
    const time = timeInput.value;

    if (text) {
        tasks.push({ text, deadline, time, done: false, reminded: false });
        saveTasks();
        renderTasks();

        // ✅ Thông báo khi thêm task mới
        new Notification("📝 Công việc mới!", {
            body: `📝 ${text} - Hạn: ${deadline || "Không"}${time ? " " + time : ""}`
        });

        input.value = "";
        dateInput.value = "";
        timeInput.value = "";
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

    if (window.electronAPI) {
        window.electronAPI.getAppVersion().then((v) => {
            versionEl.textContent = v;
        });
    }
});

// 🕒 Hàm nhắc task đúng giờ
function checkUpcomingTasks() {
    const now = new Date();

    tasks.forEach(task => {
        if (!task.done && task.deadline && task.time && !task.reminded) {
            const taskDateTime = new Date(`${task.deadline}T${task.time}`);
            const diff = taskDateTime.getTime() - now.getTime();

            // Nếu thời gian hiện tại cách task <= 1 phút => nhắc
            if (diff >= 0 && diff < 60 * 1000) {
                new Notification("🔔 Nhắc đúng giờ!", {
                    body: `📝 ${task.text} - Hạn: ${task.deadline} ${task.time}`
                });

                task.reminded = true; // ✅ Đánh dấu đã nhắc
                saveTasks();
            }
        }
    });
}

setInterval(checkUpcomingTasks, 60 * 1000);
checkUpcomingTasks();
