// ===================================
// UNIVERSITY PLANNER - USER APP
// ===================================

const API_BASE_URL = 'http://localhost:3000';
const TASKS_ENDPOINT = `${API_BASE_URL}/tasks`;

// State Management
const state = {
    allTasks: [],
    filteredTasks: [],
    searchTimeout: null,
    editingTaskId: null
};

// DOM Elements
const taskForm = document.getElementById('taskForm');
const tasksContainer = document.getElementById('tasksContainer');
const loadingSpinner = document.getElementById('loadingSpinner');
const mainContent = document.getElementById('mainContent');
const alertContainer = document.getElementById('alertContainer');
const noTasksMessage = document.getElementById('noTasksMessage');
const taskCount = document.getElementById('taskCount');

// Filter Elements
const searchInput = document.getElementById('searchInput');
const courseFilter = document.getElementById('courseFilter');
const categoryFilter = document.getElementById('categoryFilter');
const priorityFilter = document.getElementById('priorityFilter');
const statusFilter = document.getElementById('statusFilter');
const resetFiltersBtn = document.getElementById('resetFilters');

// ===================================
// INITIALIZATION
// ===================================

async function initializeApp() {
    try {
        showLoading();
        await fetchTasks();
        populateFilterOptions();
        attachEventListeners();
        renderTasks(state.allTasks);
        hideLoading();
    } catch (error) {
        hideLoading();
        showError('Failed to load the application. Please refresh the page.');
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

async function addTask(taskData) {
    try {
        const response = await fetch(TASKS_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(taskData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const newTask = await response.json();
        showSuccess('Task added successfully!');
        await refreshTasks();
        return newTask;
    } catch (error) {
        showError('Failed to add task. Please try again.');
        throw error;
    }
}

// ===================================
// RENDERING FUNCTIONS
// ===================================

function renderTasks(tasks) {
    tasksContainer.innerHTML = '';

    if (tasks.length === 0) {
        noTasksMessage.style.display = 'block';
        taskCount.textContent = '0';
        return;
    }

    noTasksMessage.style.display = 'none';
    taskCount.textContent = tasks.length;

    tasks.forEach(task => {
        const taskCard = createTaskCard(task);
        tasksContainer.appendChild(taskCard);
    });
}

function createTaskCard(task) {
    const card = document.createElement('div');
    card.className = `col-md-6 col-lg-4 fade-in`;
    
    const statusBadgeClass = `badge-${task.status}`;
    const categoryBadgeClass = `badge-${task.category}`;
    const priorityClass = `priority-${task.priority}`;
    const statusClass = `status-${task.status}`;

    const dueDateFormatted = formatDate(task.dueDate);
    const isOverdue = isDatePassed(task.dueDate) && task.status !== 'completed';

    card.innerHTML = `
        <div class="card task-card ${priorityClass} ${statusClass}">
            <div class="card-body">
                <h5 class="task-title">${escapeHtml(task.title)}</h5>
                
                <div class="task-meta">
                    <span class="badge bg-secondary">${task.course}</span>
                    <span class="badge ${categoryBadgeClass}">${capitalizeFirst(task.category)}</span>
                    <span class="badge ${getPriorityBadgeClass(task.priority)}">
                        ${capitalizeFirst(task.priority)} Priority
                    </span>
                    <span class="badge ${statusBadgeClass}">${capitalizeFirst(task.status)}</span>
                </div>

                <p class="task-description">${escapeHtml(task.description)}</p>

                <div class="task-footer">
                    <div>
                        <strong>Due:</strong> 
                        <span ${isOverdue ? 'style="color: red; font-weight: bold;"' : ''}>
                            ${dueDateFormatted}
                        </span>
                        ${isOverdue ? '<span class="badge bg-danger ms-2">Overdue</span>' : ''}
                    </div>
                    <small class="text-muted">Added: ${formatDate(task.createdAt)}</small>
                </div>
            </div>
        </div>
    `;

    return card;
}

// ===================================
// FORM VALIDATION
// ===================================

function validateForm(formData) {
    const errors = {};

    // Title validation
    if (!formData.title.trim()) {
        errors.title = 'Title is required';
    } else if (formData.title.trim().length < 3) {
        errors.title = 'Title must be at least 3 characters';
    }

    // Course validation
    if (!formData.course.trim()) {
        errors.course = 'Course is required';
    }

    // Category validation
    if (!formData.category) {
        errors.category = 'Category is required';
    }

    // Priority validation
    if (!formData.priority) {
        errors.priority = 'Priority is required';
    }

    // Due Date validation
    if (!formData.dueDate) {
        errors.dueDate = 'Due date is required';
    } else if (!isFutureDate(formData.dueDate)) {
        errors.dueDate = 'Due date must be in the future';
    }

    // Description validation
    if (!formData.description.trim()) {
        errors.description = 'Description is required';
    } else if (formData.description.trim().length < 5) {
        errors.description = 'Description must be at least 5 characters';
    }

    return errors;
}

function displayFormErrors(errors) {
    clearFormErrors();

    Object.keys(errors).forEach(field => {
        const errorElement = document.getElementById(`${field}Error`);
        if (errorElement) {
            errorElement.textContent = errors[field];
            errorElement.style.display = 'block';
        }
    });
}

function clearFormErrors() {
    const errorElements = document.querySelectorAll('[id$="Error"]');
    errorElements.forEach(element => {
        element.style.display = 'none';
        element.textContent = '';
    });
}

// ===================================
// FILTER & SEARCH FUNCTIONS
// ===================================

function populateFilterOptions() {
    const courses = [...new Set(state.allTasks.map(task => task.course))].sort();
    
    courseFilter.innerHTML = '<option value="">All Courses</option>';
    courses.forEach(course => {
        const option = document.createElement('option');
        option.value = course;
        option.textContent = course;
        courseFilter.appendChild(option);
    });
}

function filterTasks() {
    const searchTerm = searchInput.value.toLowerCase();
    const course = courseFilter.value;
    const category = categoryFilter.value;
    const priority = priorityFilter.value;
    const status = statusFilter.value;

    state.filteredTasks = state.allTasks.filter(task => {
        const matchesSearch = searchTerm === '' || 
            task.title.toLowerCase().includes(searchTerm) ||
            task.course.toLowerCase().includes(searchTerm) ||
            task.description.toLowerCase().includes(searchTerm) ||
            task.category.toLowerCase().includes(searchTerm);

        const matchesCourse = course === '' || task.course === course;
        const matchesCategory = category === '' || task.category === category;
        const matchesPriority = priority === '' || task.priority === priority;
        const matchesStatus = status === '' || task.status === status;

        return matchesSearch && matchesCourse && matchesCategory && matchesPriority && matchesStatus;
    });

    renderTasks(state.filteredTasks);
}

function debounceSearch(callback, delay = 300) {
    clearTimeout(state.searchTimeout);
    state.searchTimeout = setTimeout(callback, delay);
}

function resetFilters() {
    searchInput.value = '';
    courseFilter.value = '';
    categoryFilter.value = '';
    priorityFilter.value = '';
    statusFilter.value = '';
    state.filteredTasks = [...state.allTasks];
    renderTasks(state.filteredTasks);
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
        populateFilterOptions();
        filterTasks();
        taskForm.reset();
        clearFormErrors();
    } catch (error) {
        showError('Failed to refresh tasks.');
    }
}

// ===================================
// EVENT LISTENERS
// ===================================

function attachEventListeners() {
    // Form submission
    taskForm.addEventListener('submit', handleFormSubmit);

    // Filter listeners
    searchInput.addEventListener('input', () => {
        debounceSearch(() => filterTasks(), 300);
    });

    courseFilter.addEventListener('change', filterTasks);
    categoryFilter.addEventListener('change', filterTasks);
    priorityFilter.addEventListener('change', filterTasks);
    statusFilter.addEventListener('change', filterTasks);

    // Reset filters
    resetFiltersBtn.addEventListener('click', resetFilters);
}

async function handleFormSubmit(e) {
    e.preventDefault();

    const formData = {
        title: document.getElementById('title').value,
        course: document.getElementById('course').value,
        category: document.getElementById('category').value,
        priority: document.getElementById('priority').value,
        dueDate: document.getElementById('dueDate').value,
        description: document.getElementById('description').value,
        status: 'pending',
        createdAt: new Date().toISOString().split('T')[0]
    };

    // Validate form
    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
        displayFormErrors(errors);
        return;
    }

    try {
        await addTask(formData);
    } catch (error) {
        // Error already shown in addTask
    }
}

// ===================================
// UTILITY FUNCTIONS
// ===================================

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function isFutureDate(dateString) {
    const inputDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return inputDate >= today;
}

function isDatePassed(dateString) {
    const inputDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return inputDate < today;
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
