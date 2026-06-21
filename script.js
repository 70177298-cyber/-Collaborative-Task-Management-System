// ==================== DATA STRUCTURES & CLASSES ====================

/**
 * User class representing a team member
 */
class User {
    constructor(id, name, email, role = 'Team Member') {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.assignedTasks = [];
        this.createdAt = new Date();
    }

    /**
     * Get user's profile information
     */
    getProfile() {
        return {
            id: this.id,
            name: this.name,
            email: this.email,
            role: this.role,
            taskCount: this.assignedTasks.length
        };
    }

    /**
     * Add a task to user's assigned tasks
     */
    addTask(taskId) {
        if (!this.assignedTasks.includes(taskId)) {
            this.assignedTasks.push(taskId);
        }
    }

    /**
     * Remove a task from user's assigned tasks
     */
    removeTask(taskId) {
        this.assignedTasks = this.assignedTasks.filter(id => id !== taskId);
    }

    /**
     * Get all assigned tasks count
     */
    getTaskCount() {
        return this.assignedTasks.length;
    }
}

/**
 * Task class representing a project task
 */
class Task {
    constructor(id, name, description = '', priority = 'medium', assignedUserId = null, dueDate = null, status = 'todo') {
        this.id = id;
        this.name = name;
        this.description = description;
        this.priority = priority; // 'low', 'medium', 'high'
        this.assignedUserId = assignedUserId;
        this.dueDate = dueDate;
        this.status = status; // 'todo', 'in-progress', 'completed'
        this.createdAt = new Date();
        this.updatedAt = new Date();
        this.subtasks = [];
        this.comments = [];
        this.attachments = [];
    }

    /**
     * Format task description - truncate long descriptions
     */
    getFormattedDescription(maxLength = 100) {
        if (this.description.length > maxLength) {
            return this.description.substring(0, maxLength) + '...';
        }
        return this.description;
    }

    /**
     * Update task details
     */
    update(name, description, priority, assignedUserId, dueDate, status) {
        this.name = name;
        this.description = description;
        this.priority = priority;
        this.assignedUserId = assignedUserId;
        this.dueDate = dueDate;
        this.status = status;
        this.updatedAt = new Date();
    }

    /**
     * Mark task as completed
     */
    markCompleted() {
        this.status = 'completed';
        this.updatedAt = new Date();
    }

    /**
     * Mark task as in progress
     */
    markInProgress() {
        this.status = 'in-progress';
        this.updatedAt = new Date();
    }

    /**
     * Reset task to to-do
     */
    resetToToDo() {
        this.status = 'todo';
        this.updatedAt = new Date();
    }

    /**
     * Check if task is overdue
     */
    isOverdue() {
        if (!this.dueDate || this.status === 'completed') return false;
        return new Date(this.dueDate) < new Date();
    }

    /**
     * Get priority level as number (for sorting)
     */
    getPriorityNumber() {
        const priorityMap = { 'low': 1, 'medium': 2, 'high': 3 };
        return priorityMap[this.priority] || 2;
    }

    /**
     * Add a comment to the task
     */
    addComment(userId, comment) {
        this.comments.push({
            id: Date.now(),
            userId,
            text: comment,
            createdAt: new Date()
        });
    }

    /**
     * Get task summary
     */
    getSummary() {
        return {
            id: this.id,
            name: this.name,
            description: this.getFormattedDescription(),
            priority: this.priority,
            status: this.status,
            assignedUserId: this.assignedUserId,
            dueDate: this.dueDate,
            createdAt: this.createdAt,
            isOverdue: this.isOverdue(),
            commentCount: this.comments.length
        };
    }
}

/**
 * Project class representing a collaborative project
 */
class Project {
    constructor(id, name, description = '', owner = null) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.owner = owner;
        this.tasks = [];
        this.teamMembers = [];
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    /**
     * Add a team member to the project
     */
    addTeamMember(user) {
        if (!this.teamMembers.find(m => m.id === user.id)) {
            this.teamMembers.push(user);
        }
    }

    /**
     * Get all team members
     */
    getTeamMembers() {
        return this.teamMembers;
    }

    /**
     * Get project statistics
     */
    getStatistics() {
        const completedTasks = this.tasks.filter(t => t.status === 'completed').length;
        const inProgressTasks = this.tasks.filter(t => t.status === 'in-progress').length;
        const pendingTasks = this.tasks.filter(t => t.status === 'todo').length;

        return {
            totalTasks: this.tasks.length,
            completedTasks,
            inProgressTasks,
            pendingTasks,
            completionPercentage: this.tasks.length > 0 ? Math.round((completedTasks / this.tasks.length) * 100) : 0
        };
    }

    /**
     * Get project summary
     */
    getSummary() {
        const stats = this.getStatistics();
        return {
            name: this.name,
            description: this.description,
            taskCount: this.tasks.length,
            teamMemberCount: this.teamMembers.length,
            ...stats
        };
    }
}

/**
 * TaskManager class - Main management class for all project operations
 */
class TaskManager {
    constructor() {
        this.project = null;
        this.users = [];
        this.notifications = [];
        this.currentFilter = 'all';
        this.currentPriorityFilter = '';
        this.currentEditingTaskId = null;
        this.initializeApp();
    }

    /**
     * Initialize the application with sample data
     */
    initializeApp() {
        // Create users
        this.users = [
            new User(1, 'Sarah Johnson', 'sarah@project.com', 'Project Manager'),
            new User(2, 'Mike Chen', 'mike@project.com', 'Developer'),
            new User(3, 'Emma Davis', 'emma@project.com', 'Designer'),
            new User(4, 'Alex Rodriguez', 'alex@project.com', 'QA Engineer')
        ];

        // Create project
        this.project = new Project(1, 'E-Commerce Platform', 'Building a modern e-commerce solution', this.users[0]);
        this.project.teamMembers = this.users;

        // Create sample tasks
        const now = new Date();
        const taskData = [
            {
                name: 'Design Homepage',
                description: 'Create UI design for the homepage including hero section and featured products',
                priority: 'high',
                assignedUserId: 3,
                dueDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
                status: 'in-progress'
            },
            {
                name: 'Setup Database Schema',
                description: 'Design and implement database schema for products, orders, and users',
                priority: 'high',
                assignedUserId: 2,
                dueDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
                status: 'todo'
            },
            {
                name: 'Create Product Listing Page',
                description: 'Build responsive product listing with filtering and sorting capabilities',
                priority: 'medium',
                assignedUserId: 2,
                dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
                status: 'todo'
            },
            {
                name: 'Implement Authentication',
                description: 'Add user login, signup, and session management',
                priority: 'high',
                assignedUserId: 2,
                dueDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
                status: 'todo'
            },
            {
                name: 'Design Payment Interface',
                description: 'Create payment gateway integration UI',
                priority: 'medium',
                assignedUserId: 3,
                dueDate: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000),
                status: 'in-progress'
            },
            {
                name: 'Test Payment Flow',
                description: 'QA testing for the complete payment process',
                priority: 'high',
                assignedUserId: 4,
                dueDate: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000),
                status: 'todo'
            },
            {
                name: 'Setup Email Notifications',
                description: 'Configure email service for order confirmations and notifications',
                priority: 'low',
                assignedUserId: 2,
                dueDate: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000),
                status: 'todo'
            }
        ];

        taskData.forEach((data, index) => {
            const task = new Task(
                index + 1,
                data.name,
                data.description,
                data.priority,
                data.assignedUserId,
                data.dueDate,
                data.status
            );
            this.project.tasks.push(task);
            const user = this.users.find(u => u.id === data.assignedUserId);
            if (user) {
                user.addTask(task.id);
            }
        });

        this.loadFromLocalStorage();
        this.setupEventListeners();
        this.renderTaskList();
        this.updateUserFilter();
    }

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Create Task Button
        document.getElementById('createTaskBtn').addEventListener('click', () => this.openCreateModal());

        // Task Form Submit
        document.getElementById('taskForm').addEventListener('submit', (e) => this.handleTaskFormSubmit(e));

        // Filter Changes
        document.getElementById('statusFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('priorityFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('userFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('sortBy').addEventListener('change', () => this.renderTaskList());
        document.getElementById('searchBox').addEventListener('input', () => this.applyFilters());

        // Sidebar Filters
        document.querySelectorAll('[data-filter]').forEach(item => {
            item.addEventListener('click', (e) => this.handleSidebarFilter(e));
        });

        document.querySelectorAll('[data-filter-priority]').forEach(item => {
            item.addEventListener('click', (e) => this.handleSidebarPriorityFilter(e));
        });

        // Clear Completed Button
        document.getElementById('clearCompleted').addEventListener('click', () => this.clearCompletedTasks());

        // Notification Bell
        document.getElementById('notificationBell').addEventListener('click', () => this.toggleNotificationsPanel());

        // View Reports
        document.getElementById('viewReports').addEventListener('click', () => this.showReports());

        // Modal Close on Outside Click
        document.getElementById('taskModal').addEventListener('click', (e) => {
            if (e.target.id === 'taskModal') {
                this.closeModal();
            }
        });
    }

    /**
     * Open task creation modal
     */
    openCreateModal() {
        this.currentEditingTaskId = null;
        document.getElementById('modalTitle').textContent = 'Create New Task';
        document.getElementById('taskForm').reset();
        document.getElementById('taskStatus').value = 'todo';
        document.getElementById('taskPriority').value = 'medium';
        
        // Set default due date to 7 days from now
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 7);
        document.getElementById('taskDueDate').valueAsDate = tomorrow;
        
        document.getElementById('taskModal').classList.add('active');
    }

    /**
     * Close task modal
     */
    closeModal() {
        document.getElementById('taskModal').classList.remove('active');
        this.currentEditingTaskId = null;
    }

    /**
     * Handle task form submission
     */
    handleTaskFormSubmit(e) {
        e.preventDefault();

        const taskName = document.getElementById('taskName').value.trim();
        const taskDescription = document.getElementById('taskDescription').value.trim();
        const taskPriority = document.getElementById('taskPriority').value;
        const taskAssignee = parseInt(document.getElementById('taskAssignee').value);
        const taskDueDate = document.getElementById('taskDueDate').valueAsDate;
        const taskStatus = document.getElementById('taskStatus').value;

        if (!taskName) {
            this.addNotification('Please enter a task name', 'update');
            return;
        }

        if (this.currentEditingTaskId === null) {
            // Create new task
            this.createTask(taskName, taskDescription, taskPriority, taskAssignee, taskDueDate, taskStatus);
        } else {
            // Update existing task
            this.updateTask(this.currentEditingTaskId, taskName, taskDescription, taskPriority, taskAssignee, taskDueDate, taskStatus);
        }

        this.closeModal();
        this.renderTaskList();
        this.saveToLocalStorage();
    }

    /**
     * Create a new task
     */
    createTask(name, description, priority, assignedUserId, dueDate, status = 'todo') {
        const task = new Task(
            Date.now(),
            name,
            description,
            priority,
            assignedUserId,
            dueDate,
            status
        );

        this.project.tasks.push(task);

        const assignedUser = this.users.find(u => u.id === assignedUserId);
        if (assignedUser) {
            assignedUser.addTask(task.id);
        }

        this.addNotification(`Task "${name}" created successfully`, 'task');
        return task;
    }

    /**
     * Update an existing task
     */
    updateTask(taskId, name, description, priority, assignedUserId, dueDate, status) {
        const task = this.project.tasks.find(t => t.id === taskId);
        if (!task) return;

        const oldAssignedUserId = task.assignedUserId;

        task.update(name, description, priority, assignedUserId, dueDate, status);

        // Update user assignments
        if (oldAssignedUserId !== assignedUserId) {
            if (oldAssignedUserId) {
                const oldUser = this.users.find(u => u.id === oldAssignedUserId);
                if (oldUser) oldUser.removeTask(taskId);
            }

            const newUser = this.users.find(u => u.id === assignedUserId);
            if (newUser) {
                newUser.addTask(taskId);
            }

            this.addNotification(`Task "${name}" reassigned to ${newUser?.name || 'Unassigned'}`, 'assignment');
        }

        this.addNotification(`Task "${name}" updated successfully`, 'update');
    }

    /**
     * Delete a task
     */
    deleteTask(taskId) {
        const task = this.project.tasks.find(t => t.id === taskId);
        if (!task) return;

        const taskName = task.name;
        const assignedUser = this.users.find(u => u.id === task.assignedUserId);
        if (assignedUser) {
            assignedUser.removeTask(taskId);
        }

        this.project.tasks = this.project.tasks.filter(t => t.id !== taskId);
        this.addNotification(`Task "${taskName}" deleted`, 'update');
        this.renderTaskList();
        this.saveToLocalStorage();
    }

    /**
     * Mark task as completed
     */
    markTaskCompleted(taskId) {
        const task = this.project.tasks.find(t => t.id === taskId);
        if (!task) return;

        task.markCompleted();
        this.addNotification(`Task "${task.name}" marked as completed ✅`, 'task');
        this.renderTaskList();
        this.saveToLocalStorage();
    }

    /**
     * Edit a task
     */
    editTask(taskId) {
        const task = this.project.tasks.find(t => t.id === taskId);
        if (!task) return;

        this.currentEditingTaskId = taskId;
        document.getElementById('modalTitle').textContent = 'Edit Task';
        document.getElementById('taskName').value = task.name;
        document.getElementById('taskDescription').value = task.description;
        document.getElementById('taskPriority').value = task.priority;
        document.getElementById('taskAssignee').value = task.assignedUserId;
        document.getElementById('taskDueDate').valueAsDate = new Date(task.dueDate);
        document.getElementById('taskStatus').value = task.status;

        document.getElementById('taskModal').classList.add('active');
    }

    /**
     * Clear all completed tasks
     */
    clearCompletedTasks() {
        if (!confirm('Are you sure you want to delete all completed tasks?')) return;

        const completedTasks = this.project.tasks.filter(t => t.status === 'completed');
        completedTasks.forEach(task => {
            const assignedUser = this.users.find(u => u.id === task.assignedUserId);
            if (assignedUser) {
                assignedUser.removeTask(task.id);
            }
        });

        this.project.tasks = this.project.tasks.filter(t => t.status !== 'completed');
        this.addNotification(`${completedTasks.length} completed task(s) deleted`, 'update');
        this.renderTaskList();
        this.saveToLocalStorage();
    }

    /**
     * Apply filters to task list
     */
    applyFilters() {
        this.renderTaskList();
    }

    /**
     * Handle sidebar filter clicks
     */
    handleSidebarFilter(e) {
        // Remove active class from all sidebar items
        document.querySelectorAll('[data-filter]').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelectorAll('[data-filter-priority]').forEach(item => {
            item.classList.remove('active');
        });

        e.target.classList.add('active');
        this.currentFilter = e.target.dataset.filter;
        this.currentPriorityFilter = '';

        // Reset filter dropdowns
        document.getElementById('statusFilter').value = '';
        document.getElementById('priorityFilter').value = '';
        document.getElementById('userFilter').value = '';

        this.renderTaskList();
    }

    /**
     * Handle sidebar priority filter clicks
     */
    handleSidebarPriorityFilter(e) {
        document.querySelectorAll('[data-filter-priority]').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelectorAll('[data-filter]').forEach(item => {
            item.classList.remove('active');
        });

        e.target.classList.add('active');
        this.currentPriorityFilter = e.target.dataset.filterPriority;
        this.currentFilter = 'all';

        document.getElementById('statusFilter').value = '';
        document.getElementById('priorityFilter').value = '';
        document.getElementById('userFilter').value = '';

        this.renderTaskList();
    }

    /**
     * Filter tasks based on current filters
     */
    getFilteredTasks() {
        let filtered = this.project.tasks;

        // Apply sidebar filter
        if (this.currentFilter === 'assigned-to-me') {
            // For demo, assume current user is the first user
            filtered = filtered.filter(t => t.assignedUserId === 2);
        } else if (this.currentFilter === 'in-progress') {
            filtered = filtered.filter(t => t.status === 'in-progress');
        } else if (this.currentFilter === 'completed') {
            filtered = filtered.filter(t => t.status === 'completed');
        }

        // Apply priority filter
        if (this.currentPriorityFilter) {
            filtered = filtered.filter(t => t.priority === this.currentPriorityFilter);
        }

        // Apply status filter
        const statusFilter = document.getElementById('statusFilter').value;
        if (statusFilter) {
            filtered = filtered.filter(t => t.status === statusFilter);
        }

        // Apply priority dropdown filter
        const priorityFilter = document.getElementById('priorityFilter').value;
        if (priorityFilter) {
            filtered = filtered.filter(t => t.priority === priorityFilter);
        }

        // Apply user filter
        const userFilter = document.getElementById('userFilter').value;
        if (userFilter) {
            filtered = filtered.filter(t => t.assignedUserId === parseInt(userFilter));
        }

        // Apply search
        const searchTerm = document.getElementById('searchBox').value.toLowerCase();
        if (searchTerm) {
            filtered = filtered.filter(t => 
                t.name.toLowerCase().includes(searchTerm) || 
                t.description.toLowerCase().includes(searchTerm)
            );
        }

        return filtered;
    }

    /**
     * Sort tasks based on selected criteria
     */
    sortTasks(tasks) {
        const sortBy = document.getElementById('sortBy').value;
        const sorted = [...tasks];

        switch(sortBy) {
            case 'priority':
                sorted.sort((a, b) => b.getPriorityNumber() - a.getPriorityNumber());
                break;
            case 'created':
                sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'due-date':
            default:
                sorted.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
                break;
        }

        return sorted;
    }

    /**
     * Render the task list
     */
    renderTaskList() {
        const taskList = document.getElementById('taskList');
        const emptyState = document.getElementById('emptyState');

        const filteredTasks = this.getFilteredTasks();
        const sortedTasks = this.sortTasks(filteredTasks);

        if (sortedTasks.length === 0) {
            taskList.innerHTML = '';
            emptyState.style.display = 'flex';
            return;
        }

        emptyState.style.display = 'none';
        taskList.innerHTML = sortedTasks.map(task => this.createTaskCardHTML(task)).join('');

        // Add event listeners to task cards
        document.querySelectorAll('.task-card').forEach(card => {
            const taskId = parseInt(card.dataset.taskId);
            
            // Edit on card click
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.task-action-btn')) {
                    this.editTask(taskId);
                }
            });

            // Delete button
            card.querySelector('.delete-btn').addEventListener('click', () => {
                if (confirm('Delete this task?')) {
                    this.deleteTask(taskId);
                }
            });

            // Complete button
            card.querySelector('.complete-btn').addEventListener('click', () => {
                this.markTaskCompleted(taskId);
            });
        });
    }

    /**
     * Create task card HTML
     */
    createTaskCardHTML(task) {
        const assignedUser = this.users.find(u => u.id === task.assignedUserId);
        const dueDate = new Date(task.dueDate);
        const isOverdue = task.isOverdue();
        const priorityClass = `${task.priority}-priority`;
        const statusClass = `status-${task.status}`;

        const dueDateStr = dueDate.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
        });

        return `
            <div class="task-card ${priorityClass}" data-task-id="${task.id}">
                <div class="task-header">
                    <div class="task-title">${this.escapeHtml(task.name)}</div>
                    <div class="task-actions">
                        <button class="task-action-btn delete-btn" title="Delete task">🗑️</button>
                        <button class="task-action-btn complete-btn" title="Mark as complete">✅</button>
                    </div>
                </div>

                <div class="task-description">${this.escapeHtml(task.getFormattedDescription())}</div>

                <div class="task-meta">
                    <span class="task-status ${statusClass}">${task.status.replace('-', ' ')}</span>
                    <span class="task-priority priority-${task.priority}">${task.priority}</span>
                </div>

                <div class="task-meta">
                    ${assignedUser ? `<span class="task-assigned-user">👤 ${assignedUser.name}</span>` : ''}
                    <span class="task-due-date ${isOverdue ? 'overdue' : ''}">
                        📅 ${dueDateStr}
                        ${isOverdue ? ' ⚠️ Overdue' : ''}
                    </span>
                </div>
            </div>
        `;
    }

    /**
     * Escape HTML special characters
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Update user filter dropdown
     */
    updateUserFilter() {
        const userFilter = document.getElementById('userFilter');
        const taskAssignee = document.getElementById('taskAssignee');

        const userOptions = this.users.map(user => 
            `<option value="${user.id}">${user.name}</option>`
        ).join('');

        userFilter.innerHTML = '<option value="">All Users</option>' + userOptions;
        taskAssignee.innerHTML = userOptions;
    }

    /**
     * Add notification
     */
    addNotification(message, type = 'update') {
        const notification = {
            id: Date.now(),
            message,
            type,
            timestamp: new Date(),
            unread: true
        };

        this.notifications.unshift(notification);

        // Keep only last 50 notifications
        if (this.notifications.length > 50) {
            this.notifications = this.notifications.slice(0, 50);
        }

        this.updateNotificationsBadge();
        this.renderNotifications();
        this.saveToLocalStorage();
    }

    /**
     * Update notifications badge
     */
    updateNotificationsBadge() {
        const unreadCount = this.notifications.filter(n => n.unread).length;
        const badge = document.getElementById('notificationBadge');

        if (unreadCount > 0) {
            badge.textContent = unreadCount;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    }

    /**
     * Render notifications in the panel
     */
    renderNotifications() {
        const notificationsList = document.getElementById('notificationsList');
        
        if (this.notifications.length === 0) {
            notificationsList.innerHTML = '<div style="padding: 20px; text-align: center; color: #999;">No notifications</div>';
            return;
        }

        notificationsList.innerHTML = this.notifications.map(notif => `
            <div class="notification-item ${notif.unread ? 'unread' : ''}">
                <div class="notification-type notification-type-${notif.type}">${notif.type.toUpperCase()}</div>
                <div>${notif.message}</div>
                <small style="color: #999;">${this.getTimeAgo(notif.timestamp)}</small>
            </div>
        `).join('');
    }

    /**
     * Get time ago string
     */
    getTimeAgo(date) {
        const seconds = Math.floor((new Date() - date) / 1000);
        
        if (seconds < 60) return 'just now';
        if (seconds < 3600) return Math.floor(seconds / 60) + 'm ago';
        if (seconds < 86400) return Math.floor(seconds / 3600) + 'h ago';
        return Math.floor(seconds / 86400) + 'd ago';
    }

    /**
     * Toggle notifications panel
     */
    toggleNotificationsPanel() {
        const panel = document.getElementById('notificationsPanel');
        panel.classList.toggle('active');

        // Mark notifications as read
        this.notifications.forEach(notif => notif.unread = false);
        this.updateNotificationsBadge();
        this.renderNotifications();
    }

    /**
     * Show reports
     */
    showReports() {
        document.getElementById('reportsSection').style.display = 'block';
        document.getElementById('taskList').style.display = 'none';

        const stats = this.project.getStatistics();
        document.getElementById('totalTasks').textContent = stats.totalTasks;
        document.getElementById('completedTasks').textContent = stats.completedTasks;
        document.getElementById('inProgressTasks').textContent = stats.inProgressTasks;
        document.getElementById('pendingTasks').textContent = stats.pendingTasks;

        // Generate detailed report table
        const reportBody = document.getElementById('reportTableBody');
        const tasksForReport = [...this.project.tasks].sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
        );

        reportBody.innerHTML = tasksForReport.map(task => {
            const user = this.users.find(u => u.id === task.assignedUserId);
            return `
                <tr style="border-bottom: 1px solid var(--light-bg);">
                    <td style="padding: 10px;">${this.escapeHtml(task.name)}</td>
                    <td style="padding: 10px;"><span class="task-status status-${task.status}">${task.status}</span></td>
                    <td style="padding: 10px;"><span class="task-priority priority-${task.priority}">${task.priority}</span></td>
                    <td style="padding: 10px;">${user ? user.name : 'Unassigned'}</td>
                    <td style="padding: 10px;">${new Date(task.dueDate).toLocaleDateString()}</td>
                </tr>
            `;
        }).join('');

        // Scroll to reports
        document.getElementById('reportsSection').scrollIntoView({ behavior: 'smooth' });
    }

    /**
     * Hide reports and show task list
     */
    hideReports() {
        document.getElementById('reportsSection').style.display = 'none';
        document.getElementById('taskList').style.display = 'grid';
    }

    /**
     * Save data to local storage
     */
    saveToLocalStorage() {
        const data = {
            tasks: this.project.tasks,
            users: this.users,
            notifications: this.notifications
        };
        localStorage.setItem('projectManagerData', JSON.stringify(data));
    }

    /**
     * Load data from local storage
     */
    loadFromLocalStorage() {
        const saved = localStorage.getItem('projectManagerData');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                if (data.tasks && data.tasks.length > 0) {
                    this.project.tasks = data.tasks;
                    this.users = data.users;
                    if (data.notifications) {
                        this.notifications = data.notifications;
                    }
                }
            } catch (e) {
                console.error('Error loading data from localStorage:', e);
            }
        }
    }
}

// Initialize the Task Manager
const taskManager = new TaskManager();

// Update notifications and reports view when sidebar is clicked
const originalViewReports = taskManager.showReports.bind(taskManager);
document.getElementById('viewReports').addEventListener('click', () => {
    originalViewReports();
});

// Add event to return from reports
document.addEventListener('click', (e) => {
    if (e.target.closest('[data-filter], [data-filter-priority]')) {
        document.getElementById('reportsSection').style.display = 'none';
        document.getElementById('taskList').style.display = 'grid';
    }
});
