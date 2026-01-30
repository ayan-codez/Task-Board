let tasks = [];
let currentEditId = null;

function init() {
    loadTasks();
    renderAllTasks();
    setupEventListeners();
    updateStatistics();
}

function setupEventListeners() {
    document.getElementById('taskForm').addEventListener('submit', handleAddTask);
    document.getElementById('editForm').addEventListener('submit', handleEditTask);
    
    document.querySelector('.close').addEventListener('click', closeEditModal);
    
    window.addEventListener('click', (e) => {
        const modal = document.getElementById('editModal');
        if (e.target === modal) {
            closeEditModal();
        }
    });
    
    const containers = document.querySelectorAll('.tasks-container');
    containers.forEach(container => {
        container.addEventListener('dragover', handleDragOver);
        container.addEventListener('drop', handleDrop);
        container.addEventListener('dragleave', handleDragLeave);
    });
}

function handleAddTask(e) {
    e.preventDefault();
    
    const title = document.getElementById('taskTitle').value;
    const description = document.getElementById('taskDescription').value;
    const priority = document.getElementById('taskPriority').value;
    
    const task = {
        id: Date.now(),
        title,
        description,
        priority,
        status: 'todo',
        createdAt: new Date().toISOString()
    };
    
    tasks.push(task);
    saveTasks();
    renderAllTasks();
    updateStatistics();
    
    document.getElementById('taskForm').reset();
}

function handleEditTask(e) {
    e.preventDefault();
    
    const title = document.getElementById('editTitle').value;
    const description = document.getElementById('editDescription').value;
    const priority = document.getElementById('editPriority').value;
    const status = document.getElementById('editStatus').value;
    
    const taskIndex = tasks.findIndex(t => t.id === currentEditId);
    if (taskIndex !== -1) {
        tasks[taskIndex] = {
            ...tasks[taskIndex],
            title,
            description,
            priority,
            status
        };
        saveTasks();
        renderAllTasks();
        updateStatistics();
        closeEditModal();
    }
}

function openEditModal(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        currentEditId = taskId;
        document.getElementById('editTitle').value = task.title;
        document.getElementById('editDescription').value = task.description;
        document.getElementById('editPriority').value = task.priority;
        document.getElementById('editStatus').value = task.status;
        document.getElementById('editModal').style.display = 'block';
    }
}

function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
    currentEditId = null;
}

function deleteTask(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
        tasks = tasks.filter(t => t.id !== taskId);
        saveTasks();
        renderAllTasks();
        updateStatistics();
    }
}

function renderAllTasks() {
    const containers = {
        todo: document.getElementById('todo-tasks'),
        inprogress: document.getElementById('inprogress-tasks'),
        done: document.getElementById('done-tasks')
    };
    
    Object.values(containers).forEach(container => {
        container.innerHTML = '';
    });
    
    tasks.forEach(task => {
        const taskElement = createTaskElement(task);
        containers[task.status].appendChild(taskElement);
    });
    
    updateColumnCounts();
}

function createTaskElement(task) {
    const div = document.createElement('div');
    div.className = `task-card priority-${task.priority}`;
    div.draggable = true;
    div.dataset.taskId = task.id;
    
    div.addEventListener('dragstart', handleDragStart);
    div.addEventListener('dragend', handleDragEnd);
    
    div.innerHTML = `
        <div class="task-header">
            <div class="task-title">${escapeHtml(task.title)}</div>
            <div class="task-actions">
                <button class="task-btn edit-btn" onclick="openEditModal(${task.id})" title="Edit"></button>
                <button class="task-btn delete-btn" onclick="deleteTask(${task.id})" title="Delete"></button>
            </div>
        </div>
        ${task.description ? `<div class="task-description">${escapeHtml(task.description)}</div>` : ''}
        <span class="task-priority priority-${task.priority}">${task.priority}</span>
    `;
    
    return div;
}

function handleDragStart(e) {
    e.target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', e.target.dataset.taskId);
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    e.currentTarget.classList.add('drag-over');
}

function handleDragLeave(e) {
    if (e.currentTarget === e.target) {
        e.currentTarget.classList.remove('drag-over');
    }
}

function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    
    const taskId = parseInt(e.dataTransfer.getData('text/plain'));
    const newStatus = e.currentTarget.dataset.status;
    
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
        tasks[taskIndex].status = newStatus;
        saveTasks();
        renderAllTasks();
        updateStatistics();
    }
}

function updateColumnCounts() {
    const counts = {
        todo: tasks.filter(t => t.status === 'todo').length,
        inprogress: tasks.filter(t => t.status === 'inprogress').length,
        done: tasks.filter(t => t.status === 'done').length
    };
    
    document.getElementById('todo-count').textContent = counts.todo;
    document.getElementById('inprogress-count').textContent = counts.inprogress;
    document.getElementById('done-count').textContent = counts.done;
}

function updateStatistics() {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'done').length;
    
    document.getElementById('totalTasks').textContent = totalTasks;
    document.getElementById('completedTasks').textContent = completedTasks;
}

function saveTasks() {
    localStorage.setItem('taskBoardTasks', JSON.stringify(tasks));
}

function loadTasks() {
    const saved = localStorage.getItem('taskBoardTasks');
    if (saved) {
        tasks = JSON.parse(saved);
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

document.addEventListener('DOMContentLoaded', init);
