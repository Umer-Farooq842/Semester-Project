// ===================================
// UNIVERSITY PLANNER - ADMIN APP
// ===================================

const API_BASE_URL = 'http://localhost:3000';
const TASKS_ENDPOINT = `${API_BASE_URL}/tasks`;

// State Management
const state = {
    allTasks: [],
    filteredTasks: [],
    editingTaskId: null,
    deleteTaskId: null,
    searchTimeout: null
};

// DOM Elements
const loadingSpinner = document.getElementById('loadingSpinner');
const mainContent = document.getElementById('mainContent');
const alertContainer = document.getElementById('alertContainer');
const tasksTableBody = document.getElementById('tasksTableBody');
const editTaskForm = document.getElementById('editTaskForm');
const selectTaskMessage = document.getElementById('selectTaskMessage');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const tableTaskCount = document.getElementById('tableTaskCount');

// Statistics Elements
const totalTasksEl = document.getElementById('totalTasks');
const completedTasksEl = document.getElementById('completedTasks');
const pendingTasksEl = document.getElementById('pendingTasks');
const highPriorityTasksEl = document.getElementById('highPriorityTasks');
const completionBar = document.getElementById('completionBar');
const completionPercentage = document.getElementById('completionPercentage');
const completionStats = document.getElementById('completionStats');

// Search Elements
const adminSearchInput = document.getElementById('adminSearchInput');
const adminSearchBtn = document.getElementById('adminSearchBtn');

// Modal Elements
const deleteConfirmModal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
const deleteTaskTitle = document.getElementById('deleteTaskTitle');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

// ===================================
// INITIALIZATION
// ===================================

async function initializeApp() {
    try {
        showLoading();
        await fetchTasks();
        attachEventListeners();
        renderTasksTable(state.allTasks);
        updateStatistics();
        hideLoading();
    } catch (error) {
        hideLoading();
        showError('Failed to load the admin panel. Please refresh the page.');
    }
}

// ===================================
// FETCH OPERATIONS
// ===================================

async function fetchTasks() {
    try {
        const response = await fetch(TASKS_ENDPOINT);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        state.allTasks = await response.json();
        state.filteredTasks = [...state.allTasks];
        return state.allTasks;
    } catch (error) {
        showError('Unable to connect to the server. Make sure JSON Server is running.');
        throw error;
    }
}

async function updateTask(taskId, updatedData) {
    try {
        const response = await fetch(`${TASKS_ENDPOINT}/${taskId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const updatedTask = await response.json();
        showSuccess('Task updated successfully!');
        await refreshTasks();
        return updatedTask;
    } catch (error) {
        showError('Failed to update task. Please try again.');
        throw error;
    }
}

async function deleteTask(taskId) {
    try {
        const response = await fetch(`${TASKS_ENDPOINT}/${taskId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        showSuccess('Task deleted successfully!');
        await refreshTasks();
        return true;
    } catch (error) {
        showError('Failed to delete task. Please try again.');
        throw error;
    }
}

// ===================================
// RENDERING FUNCTIONS
// ===================================

function renderTasksTable(tasks) {
    tasksTableBody.innerHTML = '';
    tableTaskCount.textContent = tasks.length;

    if (tasks.length === 0) {
        tasksTableBody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center text-muted py-5">
                    No tasks found
                </td>
            </tr>
        `;
        return;
    }

    tasks.forEach(task => {
        const row = createTaskRow(task);
        tasksTableBody.appendChild(row);
    });
}

function createTaskRow(task) {
    const row = document.createElement('tr');
    
    const categoryBadge = `<span class="badge badge-${task.category}">${capitalizeFirst(task.category)}</span>`;
    const priorityBadge = `<span class="badge ${getPriorityBadgeClass(task.priority)}">${capitalizeFirst(task.priority)}</span>`;
    const statusBadge = `<span class="badge badge-${task.status}">${capitalizeFirst(task.status)}</span>`;

    row.innerHTML = `
        <td><strong>#${task.id}</strong></td>
        <td class="text-truncate-2">${escapeHtml(task.title)}</td>
        <td>${escapeHtml(task.course)}</td>
        <td>${categoryBadge}</td>
        <td>${priorityBadge}</td>
        <td>${formatDate(task.dueDate)}</td>
        <td>${statusBadge}</td>
        <td>
            <div class="table-action-buttons">
                <button class="btn btn-sm btn-warning" data-task-id="${task.id}" data-action="edit">
                    <i class="bi bi-pencil"></i> Edit
                </button>
                <button class="btn btn-sm btn-danger" data-task-id="${task.id}" data-action="delete">
                    <i class="bi bi-trash"></i> Delete
                </button>
            </div>
        </td>
    `;

    // Add event listeners to action buttons
    row.querySelector('[data-action="edit"]').addEventListener('click', (e) => {
        const taskId = parseInt(e.currentTarget.getAttribute('data-task-id'));
        loadTaskForEditing(taskId);
    });

    row.querySelector('[data-action="delete"]').addEventListener('click', (e) => {
        const taskId = parseInt(e.currentTarget.getAttribute('data-task-id'));
        showDeleteConfirmation(taskId);
    });

    return row;
}

// ===================================
// EDIT TASK FUNCTIONS
// ===================================

function loadTaskForEditing(taskId) {
    const task = state.allTasks.find(t => t.id === taskId);
    
    if (!task) {
        showError('Task not found');
        return;
    }

    state.editingTaskId = taskId;
    selectTaskMessage.style.display = 'none';
    editTaskForm.style.display = 'block';

    document.getElementById('editTaskId').value = task.id;
    document.getElementById('editTitle').value = task.title;
    document.getElementById('editCourse').value = task.course;
    document.getElementById('editCategory').value = task.category;
    document.getElementById('editPriority').value = task.priority;
    document.getElementById('editDueDate').value = task.dueDate;
    document.getElementById('editStatus').value = task.status;
    document.getElementById('editDescription').value = task.description;

    // Scroll to form
    editTaskForm.scrollIntoView({ behavior: 'smooth' });
}

function handleEditFormSubmit(e) {
    e.preventDefault();

    if (state.editingTaskId === null) {
        showError('No task selected for editing');
        return;
    }

    const updatedData = {
        title: document.getElementById('editTitle').value.trim(),
        course: document.getElementById('editCourse').value.trim(),
        category: document.getElementById('editCategory').value,
        priority: document.getElementById('editPriority').value,
        dueDate: document.getElementById('editDueDate').value,
        status: document.getElementById('editStatus').value,
        description: document.getElementById('editDescription').value.trim()
    };

    // Validation
    if (!updatedData.title) {
        showError('Title is required');
        return;
    }

    if (!updatedData.course) {
        showError('Course is required');
        return;
    }

    if (!updatedData.description) {
        showError('Description is required');
        return;
    }

    updateTask(state.editingTaskId, updatedData);
    cancelEditing();
}

function cancelEditing() {
    state.editingTaskId = null;
    editTaskForm.style.display = 'none';
    editTaskForm.reset();
    selectTaskMessage.style.display = 'block';
}

// ===================================
// DELETE TASK FUNCTIONS
// ===================================

function showDeleteConfirmation(taskId) {
    const task = state.allTasks.find(t => t.id === taskId);
    
    if (!task) {
        showError('Task not found');
        return;
    }

    state.deleteTaskId = taskId;
    deleteTaskTitle.textContent = `"${escapeHtml(task.title)}"`;
    deleteConfirmModal.show();
}

function handleDeleteConfirmation() {
    if (state.deleteTaskId === null) {
        showError('No task selected for deletion');
        return;
    }

    deleteTask(state.deleteTaskId);
    state.deleteTaskId = null;
    deleteConfirmModal.hide();
}

// ===================================
// STATISTICS FUNCTIONS
// ===================================

function updateStatistics() {
    const tasks = state.allTasks;

    if (tasks.length === 0) {
        totalTasksEl.textContent = '0';
        completedTasksEl.textContent = '0';
        pendingTasksEl.textContent = '0';
        highPriorityTasksEl.textContent = '0';
        completionPercentage.textContent = '0%';
        completionBar.style.width = '0%';
        completionBar.setAttribute('aria-valuenow', '0');
        completionStats.textContent = '0 of 0 tasks completed';
        return;
    }

    const completed = tasks.filter(t => t.status === 'completed').length;
    const pending = tasks.filter(t => t.status === 'pending').length;
    const highPriority = tasks.filter(t => t.priority === 'high').length;
    const percentage = Math.round((completed / tasks.length) * 100);

    totalTasksEl.textContent = tasks.length;
    completedTasksEl.textContent = completed;
    pendingTasksEl.textContent = pending;
    highPriorityTasksEl.textContent = highPriority;
    completionPercentage.textContent = `${percentage}%`;
    completionBar.style.width = `${percentage}%`;
    completionBar.setAttribute('aria-valuenow', percentage);
    completionStats.textContent = `${completed} of ${tasks.length} tasks completed`;
}

// ===================================
// SEARCH FUNCTIONS
// ===================================

function performSearch() {
    const searchTerm = adminSearchInput.value.toLowerCase();

    if (searchTerm === '') {
        state.filteredTasks = [...state.allTasks];
    } else {
        state.filteredTasks = state.allTasks.filter(task => 
            task.title.toLowerCase().includes(searchTerm) ||
            task.course.toLowerCase().includes(searchTerm) ||
            task.category.toLowerCase().includes(searchTerm)
        );
    }

    renderTasksTable(state.filteredTasks);
}

// ===================================
// ALERT & NOTIFICATION FUNCTIONS
// ===================================

function showAlert(message, type = 'info') {
    const alertId = `alert-${Date.now()}`;
    const alertHTML = `
        <div class="col-12">
            <div class="alert alert-${type} alert-dismissible fade show" id="${alertId}" role="alert">
                <i class="bi bi-info-circle"></i> ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        </div>
    `;

    alertContainer.innerHTML += alertHTML;

    setTimeout(() => {
        const alertElement = document.getElementById(alertId);
        if (alertElement) {
            alertElement.remove();
        }
    }, 5000);
}

function showSuccess(message) {
    showAlert(message, 'success');
}

function showError(message) {
    showAlert(message, 'danger');
}

function showWarning(message) {
    showAlert(message, 'warning');
}

function showLoading() {
    loadingSpinner.style.display = 'block';
    mainContent.style.display = 'none';
}

function hideLoading() {
    loadingSpinner.style.display = 'none';
    mainContent.style.display = 'block';
}

async function refreshTasks() {
    try {
        await fetchTasks();
        renderTasksTable(state.allTasks);
        updateStatistics();
    } catch (error) {
        showError('Failed to refresh tasks.');
    }
}

// ===================================
// EVENT LISTENERS
// ===================================

function attachEventListeners() {
    editTaskForm.addEventListener('submit', handleEditFormSubmit);
    cancelEditBtn.addEventListener('click', cancelEditing);
    confirmDeleteBtn.addEventListener('click', handleDeleteConfirmation);
    adminSearchBtn.addEventListener('click', performSearch);
    
    // Allow search on Enter key
    adminSearchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
}

// ===================================
// UTILITY FUNCTIONS
// ===================================

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

function getPriorityBadgeClass(priority) {
    const map = {
        'low': 'bg-info',
        'medium': 'bg-warning text-dark',
        'high': 'bg-danger'
    };
    return map[priority] || 'bg-secondary';
}

// ===================================
// APP START
// ===================================

document.addEventListener('DOMContentLoaded', initializeApp);
