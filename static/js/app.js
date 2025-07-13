// Global variables
let currentTaskId = null;
let tasks = [];
let isDarkMode = localStorage.getItem('darkMode') === 'true';

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

// DOM elements
const addTaskBtn = document.getElementById('addTaskBtn');
const taskForm = document.getElementById('taskForm');
const newTaskForm = document.getElementById('newTaskForm');
const cancelBtn = document.getElementById('cancelBtn');
const tasksList = document.getElementById('tasksList');
const taskCount = document.getElementById('taskCount');
const confirmationModal = document.getElementById('confirmationModal');
const modalTitle = document.getElementById('modalTitle');
const modalMessage = document.getElementById('modalMessage');
const modalYes = document.getElementById('modalYes');
const modalNo = document.getElementById('modalNo');
const editModal = document.getElementById('editModal');
const editTaskForm = document.getElementById('editTaskForm');
const closeEditModal = document.getElementById('closeEditModal');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');
const toastIcon = document.getElementById('toastIcon');
const darkModeToggle = document.getElementById('darkModeToggle');
const sunIcon = document.getElementById('sunIcon');
const moonIcon = document.getElementById('moonIcon');

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
    addTaskBtn.addEventListener('click', toggleTaskForm);
    
    // Cancel button
    cancelBtn.addEventListener('click', toggleTaskForm);
    
    // New task form
    newTaskForm.addEventListener('submit', handleCreateTask);
    
    // Modal buttons
    modalNo.addEventListener('click', hideConfirmationModal);
    
    // Edit modal
    closeEditModal.addEventListener('click', hideEditModal);
    cancelEditBtn.addEventListener('click', hideEditModal);
    editTaskForm.addEventListener('submit', handleUpdateTask);
    
    // Dark mode toggle
    darkModeToggle.addEventListener('click', toggleDarkMode);
    
    // Close modals on outside click
    confirmationModal.addEventListener('click', function(e) {
        if (e.target === confirmationModal) {
            hideConfirmationModal();
        }
    });
    
    editModal.addEventListener('click', function(e) {
        if (e.target === editModal) {
            hideEditModal();
        }
    });
}

// Set default date to today
function setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('dueDate').value = today;
}

// Toggle task form visibility
function toggleTaskForm() {
    taskForm.classList.toggle('hidden');
    if (!taskForm.classList.contains('hidden')) {
        newTaskForm.reset();
        setDefaultDate();
    }
}

// Load all tasks
async function loadTasks() {
    try {
        const response = await fetch('/api/tasks/');
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
                const response = await fetch(`/api/tasks/${taskId}/toggle/`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrftoken,
                    }
                });
                
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
                const response = await fetch(`/api/tasks/${taskId}/delete/`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrftoken,
                    }
                });
                
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
    document.getElementById('editTaskId').value = task.id;
    document.getElementById('editUserName').value = task.name;
    document.getElementById('editTaskTitle').value = task.title;
    document.getElementById('editTaskDescription').value = task.description;
    document.getElementById('editDueDate').value = task.due_date;
    
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
        const response = await fetch('/api/tasks/create/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,
            },
            body: JSON.stringify(taskData)
        });
        
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
        const response = await fetch(`/api/tasks/${taskId}/update/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,
            },
            body: JSON.stringify(taskData)
        });
        
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
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    confirmationModal.classList.add('show');
    
    // Store the confirmation callback
    modalYes.onclick = () => {
        hideConfirmationModal();
        onConfirm();
    };
}

// Hide confirmation modal
function hideConfirmationModal() {
    confirmationModal.classList.remove('show');
}

// Show edit modal
function showEditModal() {
    editModal.classList.add('show');
}

// Hide edit modal
function hideEditModal() {
    editModal.classList.remove('show');
}

// Update task count
function updateTaskCount() {
    const completedCount = tasks.filter(task => task.is_completed).length;
    const totalCount = tasks.length;
    taskCount.textContent = `${completedCount} of ${totalCount} tasks completed`;
}

// Show toast notification
function showToast(message, type = 'success') {
    toastMessage.textContent = message;
    
    // Set icon and colors based on type
    if (type === 'success') {
        toastIcon.innerHTML = `
            <svg class="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
            </svg>
        `;
        toast.classList.remove('bg-red-50', 'border-red-200', 'dark:bg-red-900/20', 'dark:border-red-800');
        toast.classList.add('bg-green-50', 'border-green-200', 'dark:bg-green-900/20', 'dark:border-green-800');
    } else {
        toastIcon.innerHTML = `
            <svg class="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
            </svg>
        `;
        toast.classList.remove('bg-green-50', 'border-green-200', 'dark:bg-green-900/20', 'dark:border-green-800');
        toast.classList.add('bg-red-50', 'border-red-200', 'dark:bg-red-900/20', 'dark:border-red-800');
    }
    
    toast.classList.remove('hidden');
    
    // Auto hide after 3 seconds
    setTimeout(() => {
        toast.classList.add('hidden');
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