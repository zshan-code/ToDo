// Global variables
let currentTaskId = null;
let tasks = [];
let isDarkMode = localStorage.getItem('darkMode') === 'true';

// API base path (support Vercel routing)
let API_BASE = '/api';
if (window.location.pathname.startsWith('/api/index.py')) {
    API_BASE = '/api/index.py/api';
}

// CSRF token helper
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
const csrftoken = getCookie('csrftoken');

// DOM elements (check for null)
function getEl(id) {
    const el = document.getElementById(id);
    if (!el) {
        console.error('Element not found:', id);
    }
    return el;
}
const addTaskBtn = getEl('addTaskBtn');
const taskForm = getEl('taskForm');
const newTaskForm = getEl('newTaskForm');
const cancelBtn = getEl('cancelBtn');
const tasksList = getEl('tasksList');
const taskCount = getEl('taskCount');
const confirmationModal = getEl('confirmationModal');
const modalTitle = getEl('modalTitle');
const modalMessage = getEl('modalMessage');
const modalYes = getEl('modalYes');
const modalNo = getEl('modalNo');
const editModal = getEl('editModal');
const editTaskForm = getEl('editTaskForm');
const closeEditModal = getEl('closeEditModal');
const cancelEditBtn = getEl('cancelEditBtn');
const toast = getEl('toast');
const toastMessage = getEl('toastMessage');
const toastIcon = getEl('toastIcon');
const darkModeToggle = getEl('darkModeToggle');
const sunIcon = getEl('sunIcon');
const moonIcon = getEl('moonIcon');

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    initializeDarkMode();
    loadTasks();
    setupEventListeners();
    setDefaultDate();
});

// Dark mode functionality
function initializeDarkMode() {
    if (isDarkMode) {
        document.documentElement.classList.add('dark');
        sunIcon.classList.remove('hidden');
        moonIcon.classList.add('hidden');
    } else {
        document.documentElement.classList.remove('dark');
        sunIcon.classList.add('hidden');
        moonIcon.classList.remove('hidden');
    }
}

function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    localStorage.setItem('darkMode', isDarkMode);
    
    if (isDarkMode) {
        document.documentElement.classList.add('dark');
        sunIcon.classList.remove('hidden');
        moonIcon.classList.add('hidden');
    } else {
        document.documentElement.classList.remove('dark');
        sunIcon.classList.add('hidden');
        moonIcon.classList.remove('hidden');
    }
}

// Setup event listeners
function setupEventListeners() {
    // Add task button
    if (addTaskBtn) {
        addTaskBtn.addEventListener('click', toggleTaskForm);
    }
    
    // Cancel button
    if (cancelBtn) {
        cancelBtn.addEventListener('click', toggleTaskForm);
    }
    
    // New task form
    if (newTaskForm) {
        newTaskForm.addEventListener('submit', handleCreateTask);
    }
    
    // Modal buttons
    if (modalNo) {
        modalNo.addEventListener('click', hideConfirmationModal);
    }
    
    // Edit modal
    if (closeEditModal) {
        closeEditModal.addEventListener('click', hideEditModal);
    }
    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', hideEditModal);
    }
    if (editTaskForm) {
        editTaskForm.addEventListener('submit', handleUpdateTask);
    }
    
    // Dark mode toggle
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', toggleDarkMode);
    }
    
    // Close modals on outside click
    if (confirmationModal) {
        confirmationModal.addEventListener('click', function(e) {
            if (e.target === confirmationModal) {
                hideConfirmationModal();
            }
        });
    }
    
    if (editModal) {
        editModal.addEventListener('click', function(e) {
            if (e.target === editModal) {
                hideEditModal();
            }
        });
    }
}

// Set default date to today
function setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    const dueDateInput = document.getElementById('dueDate');
    if (dueDateInput) {
        dueDateInput.value = today;
    }
}

// Toggle task form visibility
function toggleTaskForm() {
    if (taskForm) {
        taskForm.classList.toggle('hidden');
        if (!taskForm.classList.contains('hidden')) {
            if (newTaskForm) {
                newTaskForm.reset();
            }
            setDefaultDate();
        }
    }
}

// Load all tasks
async function loadTasks() {
    try {
        const response = await fetch(`${API_BASE}/tasks/`);
        if (!response.ok) {
            throw new Error('API response not ok: ' + response.status);
        }
        const data = await response.json();
        tasks = data.tasks;
        renderTasks();
        updateTaskCount();
    } catch (error) {
        showToast('Error loading tasks', 'error');
        console.error('Error loading tasks:', error);
    }
}

// Render tasks in the list
function renderTasks() {
    if (!tasksList) {
        console.error('tasksList element not found');
        return;
    }

    if (tasks.length === 0) {
        tasksList.innerHTML = `
            <div class="p-8 text-center">
                <svg class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
                <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">No tasks</h3>
                <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by creating a new task.</p>
            </div>
        `;
        return;
    }

    tasksList.innerHTML = tasks.map(task => `
        <div class="task-item p-6 hover:bg-gray-50 dark:hover:bg-gray-700 ${task.is_completed ? 'bg-green-50 dark:bg-green-900/20' : ''}">
            <div class="flex items-start justify-between">
                <div class="flex items-start space-x-3 flex-1">
                    <div class="flex items-center h-5">
                        <input type="checkbox" 
                               id="task-${task.id}" 
                               class="h-4 w-4 text-success focus:ring-success border-gray-300 dark:border-gray-600 rounded cursor-pointer bg-white dark:bg-gray-700"
                               ${task.is_completed ? 'checked' : ''}
                               onchange="handleTaskCompletion(${task.id}, this.checked)">
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center space-x-2">
                            <h3 class="text-lg font-medium text-gray-900 dark:text-white ${task.is_completed ? 'line-through text-gray-500 dark:text-gray-400' : ''}">
                                ${escapeHtml(task.title)}
                            </h3>
                            ${task.is_completed ? '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">Completed</span>' : ''}
                        </div>
                        <p class="text-sm text-gray-600 dark:text-gray-300 mt-1">${escapeHtml(task.description)}</p>
                        <div class="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                            <span class="flex items-center">
                                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                </svg>
                                ${escapeHtml(task.name)}
                            </span>
                            <span class="flex items-center">
                                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                </svg>
                                ${formatDate(task.due_date)}
                            </span>
                        </div>
                    </div>
                </div>
                <div class="flex items-center space-x-2 ml-4">
                    <button onclick="handleEditTask(${task.id})" 
                            class="text-primary hover:text-blue-600 dark:hover:text-blue-400 p-2 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                    </button>
                    <button onclick="handleDeleteTask(${task.id})" 
                            class="text-danger hover:text-red-600 dark:hover:text-red-400 p-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Handle task completion
async function handleTaskCompletion(taskId, isCompleted) {
    const message = isCompleted ? 'Have you completed this task?' : 'Mark this task as incomplete?';
    const action = isCompleted ? 'complete' : 'incomplete';
    
    showConfirmationModal(
        'Confirm Task Status',
        message,
        async () => {
            try {
                const response = await fetch(`${API_BASE}/tasks/${taskId}/toggle/`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrftoken,
                    }
                });
                if (!response.ok) {
                    throw new Error('API response not ok: ' + response.status);
                }
                const data = await response.json();
                if (data.success) {
                    await loadTasks();
                    showToast(`Task marked as ${action}`, 'success');
                } else {
                    showToast('Error updating task', 'error');
                }
            } catch (error) {
                showToast('Error updating task', 'error');
                console.error('Error updating task:', error);
            }
        }
    );
}

// Handle delete task
function handleDeleteTask(taskId) {
    showConfirmationModal(
        'Delete Task',
        'Are you sure you want to delete this task?',
        async () => {
            try {
                const response = await fetch(`${API_BASE}/tasks/${taskId}/delete/`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrftoken,
                    }
                });
                if (!response.ok) {
                    throw new Error('API response not ok: ' + response.status);
                }
                const data = await response.json();
                if (data.success) {
                    await loadTasks();
                    showToast('Task deleted successfully', 'success');
                } else {
                    showToast('Error deleting task', 'error');
                }
            } catch (error) {
                showToast('Error deleting task', 'error');
                console.error('Error deleting task:', error);
            }
        }
    );
}

// Handle edit task
function handleEditTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    // Populate edit form
    const editTaskIdInput = document.getElementById('editTaskId');
    if (editTaskIdInput) {
        editTaskIdInput.value = task.id;
    }
    const editUserNameInput = document.getElementById('editUserName');
    if (editUserNameInput) {
        editUserNameInput.value = task.name;
    }
    const editTaskTitleInput = document.getElementById('editTaskTitle');
    if (editTaskTitleInput) {
        editTaskTitleInput.value = task.title;
    }
    const editTaskDescriptionInput = document.getElementById('editTaskDescription');
    if (editTaskDescriptionInput) {
        editTaskDescriptionInput.value = task.description;
    }
    const editDueDateInput = document.getElementById('editDueDate');
    if (editDueDateInput) {
        editDueDateInput.value = task.due_date;
    }
    
    showEditModal();
}

// Handle create task
async function handleCreateTask(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const taskData = {
        name: formData.get('userName'),
        title: formData.get('taskTitle'),
        description: formData.get('taskDescription'),
        due_date: formData.get('dueDate')
    };
    
    try {
        const response = await fetch(`${API_BASE}/tasks/create/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,
            },
            body: JSON.stringify(taskData)
        });
        if (!response.ok) {
            throw new Error('API response not ok: ' + response.status);
        }
        const data = await response.json();
        if (data.success) {
            await loadTasks();
            toggleTaskForm();
            showToast('Task created successfully', 'success');
        } else {
            showToast('Error creating task', 'error');
        }
    } catch (error) {
        showToast('Error creating task', 'error');
        console.error('Error creating task:', error);
    }
}

// Handle update task
async function handleUpdateTask(e) {
    e.preventDefault();
    
    const taskId = document.getElementById('editTaskId').value;
    const formData = new FormData(e.target);
    const taskData = {
        name: formData.get('editUserName'),
        title: formData.get('editTaskTitle'),
        description: formData.get('editTaskDescription'),
        due_date: formData.get('editDueDate')
    };
    
    try {
        const response = await fetch(`${API_BASE}/tasks/${taskId}/update/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,
            },
            body: JSON.stringify(taskData)
        });
        if (!response.ok) {
            throw new Error('API response not ok: ' + response.status);
        }
        const data = await response.json();
        if (data.success) {
            await loadTasks();
            hideEditModal();
            showToast('Task updated successfully', 'success');
        } else {
            showToast('Error updating task', 'error');
        }
    } catch (error) {
        showToast('Error updating task', 'error');
        console.error('Error updating task:', error);
    }
}

// Show confirmation modal
function showConfirmationModal(title, message, onConfirm) {
    if (!modalTitle) {
        console.error('modalTitle element not found');
        return;
    }
    modalTitle.textContent = title;
    if (!modalMessage) {
        console.error('modalMessage element not found');
        return;
    }
    modalMessage.textContent = message;
    if (!confirmationModal) {
        console.error('confirmationModal element not found');
        return;
    }
    confirmationModal.classList.add('show');
    
    // Store the confirmation callback
    if (modalYes) {
        modalYes.onclick = () => {
            hideConfirmationModal();
            onConfirm();
        };
    }
}

// Hide confirmation modal
function hideConfirmationModal() {
    if (confirmationModal) {
        confirmationModal.classList.remove('show');
    }
}

// Show edit modal
function showEditModal() {
    if (editModal) {
        editModal.classList.add('show');
    }
}

// Hide edit modal
function hideEditModal() {
    if (editModal) {
        editModal.classList.remove('show');
    }
}

// Update task count
function updateTaskCount() {
    if (!taskCount) {
        console.error('taskCount element not found');
        return;
    }
    const completedCount = tasks.filter(task => task.is_completed).length;
    const totalCount = tasks.length;
    taskCount.textContent = `${completedCount} of ${totalCount} tasks completed`;
}

// Show toast notification
function showToast(message, type = 'success') {
    if (!toastMessage) {
        console.error('toastMessage element not found');
        return;
    }
    toastMessage.textContent = message;
    
    // Set icon and colors based on type
    if (!toastIcon) {
        console.error('toastIcon element not found');
        return;
    }
    if (type === 'success') {
        toastIcon.innerHTML = `
            <svg class="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
            </svg>
        `;
        if (toast) {
            toast.classList.remove('bg-red-50', 'border-red-200', 'dark:bg-red-900/20', 'dark:border-red-800');
            toast.classList.add('bg-green-50', 'border-green-200', 'dark:bg-green-900/20', 'dark:border-green-800');
        }
    } else {
        toastIcon.innerHTML = `
            <svg class="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
            </svg>
        `;
        if (toast) {
            toast.classList.remove('bg-green-50', 'border-green-200', 'dark:bg-green-900/20', 'dark:border-green-800');
            toast.classList.add('bg-red-50', 'border-red-200', 'dark:bg-red-900/20', 'dark:border-red-800');
        }
    }
    
    if (toast) {
        toast.classList.remove('hidden');
    }
    
    // Auto hide after 3 seconds
    setTimeout(() => {
        if (toast) {
            toast.classList.add('hidden');
        }
    }, 3000);
}

// Utility functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
} 