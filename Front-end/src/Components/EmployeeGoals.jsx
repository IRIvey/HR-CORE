
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationAPI, apiCall } from '../Utils/api'; // Import the API utilities
import './EmployeeGoals.css';

const EmployeeGoals = () => {
  const [goals, setGoals] = useState([]);
  const [filteredGoals, setFilteredGoals] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedGoals, setSelectedGoals] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Notification System State
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Status/Progress Update Form State
  const [showStatusForm, setShowStatusForm] = useState(false);
  const [selectedGoalForUpdate, setSelectedGoalForUpdate] = useState(null);
  const [statusUpdate, setStatusUpdate] = useState({
    status: '',
    progress: 0,
    notes: ''
  });
  
  // Role-based state
  const [role, setRole] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  
  const [filters, setFilters] = useState({
    department: '',
    status: '',
    priority: '',
    progressRange: { min: 0, max: 100 }
  });
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'asc'
  });

  const [newGoal, setNewGoal] = useState({
    employeeId: '',
    goalTitle: '',
    deadline: ''
  });

  const navigate = useNavigate();

  // Auth check effect (first priority)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await apiCall('/auth/status');
        const data = await response.json();

        if (!data.loggedIn) {
          navigate('/login');
          return;
        }
        setRole(data.user?.role || null);
        setCurrentUserId(data.user?.id || null);
        setAuthChecked(true);
      } catch (error) {
        console.error('Auth check failed:', error);
        navigate('/login');
      }
    };

    checkAuth();
  }, [navigate]);

  // Fetch data only after auth is checked
  useEffect(() => {
    if (authChecked) {
      fetchGoals();
      fetchEmployees();
      fetchNotifications();
    }
  }, [authChecked]);

  // Build/refresh departments after employees load
  useEffect(() => {
    if (authChecked) {
      fetchDepartments();
    }
  }, [employees, authChecked]);

  useEffect(() => {
    applyFiltersAndSearch();
  }, [goals, searchTerm, filters, sortConfig]);

  // Auto-refresh notifications every 30 seconds
  useEffect(() => {
    if (authChecked) {
      const interval = setInterval(() => {
        fetchNotifications();
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [authChecked]);

  const fetchGoals = async () => {
    try {
      const response = await apiCall('/api/employee-goals');
      const data = await response.json();
      setGoals(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch goals:', error);
      setGoals([]);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await apiCall('/api/employees');
      const data = await response.json();
      setEmployees(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
      setEmployees([]);
    }
  };

  // FIXED: Use the notification API utility
  const fetchNotifications = async () => {
    try {
      const notifications = await notificationAPI.getAll();
      setNotifications(notifications);
      setUnreadCount(notifications.filter(n => !n.isRead).length);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  // FIXED: Use the notification API utility
  const markNotificationAsRead = async (notificationId) => {
    try {
      await notificationAPI.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  // FIXED: Use the notification API utility
  const markAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  // Since you don't have a departments API, derive from employees
  const fetchDepartments = async () => {
    // Fallback: derive unique department names from employees
    const unique = Array.from(
      new Set(employees.map(e => e?.department?.name).filter(Boolean))
    );
    setDepartments(unique.map((name, idx) => ({ id: idx + 1, name })));
  };

  const applyFiltersAndSearch = () => {
    let filtered = [...goals];

    // Search filter
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(goal =>
        String(goal.id).toLowerCase().includes(q) ||
        (goal.employee?.name || '').toLowerCase().includes(q) ||
        (goal.employee?.department?.name || '').toLowerCase().includes(q) ||
        (goal.goalTitle || '').toLowerCase().includes(q)
      );
    }

    // Department filter
    if (filters.department) {
      filtered = filtered.filter(goal =>
        goal.employee?.department?.name === filters.department
      );
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(goal => goal.status === filters.status);
    }

    // Priority filter
    if (filters.priority) {
      filtered = filtered.filter(goal => goal.priority === filters.priority);
    }

    // Progress range filter
    filtered = filtered.filter(goal =>
      Number(goal.progress ?? 0) >= filters.progressRange.min &&
      Number(goal.progress ?? 0) <= filters.progressRange.max
    );

    // Sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (sortConfig.key === 'employee') {
          aValue = a.employee?.name || '';
          bValue = b.employee?.name || '';
        } else if (sortConfig.key === 'department') {
          aValue = a.employee?.department?.name || '';
          bValue = b.employee?.department?.name || '';
        } else if (sortConfig.key === 'deadline') {
          aValue = a.deadline ? new Date(a.deadline) : new Date(0);
          bValue = b.deadline ? new Date(b.deadline) : new Date(0);
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    setFilteredGoals(filtered);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleAddGoal = async () => {
    // Validate required fields
    if (newGoal.employeeId && newGoal.goalTitle && newGoal.deadline) {
      try {
        const payload = {
          employeeId: Number(newGoal.employeeId),
          goalTitle: newGoal.goalTitle,
          deadline: newGoal.deadline
        };

        await apiCall('/api/employee-goals', {
          method: 'POST',
          body: JSON.stringify(payload)
        });

        fetchGoals();
        fetchNotifications(); // Refresh notifications after adding goal
        setNewGoal({
          employeeId: '',
          goalTitle: '',
          deadline: ''
        });
        setShowAddForm(false);
      } catch (error) {
        console.error('Failed to add goal:', error);
        alert('Failed to add goal');
      }
    }
  };

  // Handle status and progress updates (for employees)
  const handleStatusUpdate = async () => {
    if (!selectedGoalForUpdate) return;

    try {
      const payload = {
        status: statusUpdate.status,
        progress: Number(statusUpdate.progress),
        notes: statusUpdate.notes
      };

      await apiCall(`/api/employee-goals/${selectedGoalForUpdate.id}/update-status`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });

      fetchGoals();
      fetchNotifications(); // Refresh notifications after status update
      setShowStatusForm(false);
      setSelectedGoalForUpdate(null);
      setStatusUpdate({ status: '', progress: 0, notes: '' });
      alert('Status updated successfully');
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update status');
    }
  };

  // Open status update form
  const openStatusForm = (goal) => {
    setSelectedGoalForUpdate(goal);
    setStatusUpdate({
      status: goal.status,
      progress: goal.progress || 0,
      notes: ''
    });
    setShowStatusForm(true);
  };

  const handleBulkAction = async (action) => {
    if (selectedGoals.length === 0) return;

    try {
      await apiCall('/api/employee-goals/bulk', {
        method: 'PUT',
        body: JSON.stringify({ goalIds: selectedGoals, action })
      });

      fetchGoals();
      fetchNotifications(); // Refresh notifications after bulk action
      setSelectedGoals([]);
    } catch (error) {
      console.error('Bulk action failed:', error);
      alert('Bulk action failed');
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedGoals(filteredGoals.map(goal => goal.id));
    } else {
      setSelectedGoals([]);
    }
  };

  const handleSelectGoal = (goalId) => {
    if (selectedGoals.includes(goalId)) {
      setSelectedGoals(selectedGoals.filter(id => id !== goalId));
    } else {
      setSelectedGoals([...selectedGoals, goalId]);
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      'Not Started': 'status-not-started',
      'In Progress': 'status-in-progress',
      'Completed': 'status-completed',
      'Pending': 'status-pending',
      'Overdue': 'status-overdue'
    };
    return <span className={`status-badge ${statusClasses[status] || ''}`}>{status}</span>;
  };

  const getPriorityIndicator = (priority) => {
    const priorityClasses = {
      'High': 'priority-high',
      'Medium': 'priority-medium',
      'Low': 'priority-low'
    };
    return <span className={`priority-indicator ${priorityClasses[priority] || ''}`}>{priority}</span>;
  };

  const getDueDateAlert = (deadline, status) => {
    if (status === 'Completed' || !deadline) return null;

    const today = new Date();
    const dueDate = new Date(deadline);
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return <span className="due-alert overdue">⚠️ Overdue</span>;
    } else if (diffDays <= 7) {
      return <span className="due-alert due-soon">⏰ Due Soon</span>;
    }
    return null;
  };

  const getProgressBar = (progress) => {
    const pct = Math.max(0, Math.min(100, Number(progress) || 0));
    return (
      <div className="progress-container">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${pct}%` }}
          ></div>
        </div>
        <span className="progress-text">{pct}%</span>
      </div>
    );
  };

  // Check if user can update a specific goal
  const canUpdateGoal = (goal) => {
    if (isAdmin || isTeamLead) return true;
    return goal.employee?.id === currentUserId;
  };

  // Format notification time
  const formatNotificationTime = (timestamp) => {
    const now = new Date();
    const notifTime = new Date(timestamp);
    const diffMs = now - notifTime;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return notifTime.toLocaleDateString();
  };

  // Guard while we check auth state
  if (!authChecked) return null;

  // Role-based permissions
  const isAdmin = role === 'ADMIN';
  const isTeamLead = role === 'TEAM_LEAD';
  const isEmployee = role === 'EMPLOYEE';
  const canManageGoals = isAdmin || isTeamLead;

  return (
    <div className="goals-container">
      <div className="goals-header">
        <h2 className="goals-title">Employee Goals</h2>
        
        {/* Notification Bell Icon - Show for Admin only */}
        {isAdmin && (
          <div className="notification-container">
            <button 
              className="notification-bell" 
              onClick={() => setShowNotifications(!showNotifications)}
            >
              🔔
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="notification-dropdown">
                <div className="notification-header">
                  <h3>Notifications</h3>
                  {unreadCount > 0 && (
                    <button onClick={markAllAsRead} className="mark-all-read">
                      Mark all as read
                    </button>
                  )}
                </div>
                
                <div className="notification-list">
                  {notifications.length === 0 ? (
                    <div className="no-notifications">No notifications</div>
                  ) : (
                    notifications.map(notification => (
                      <div 
                        key={notification.id} 
                        className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                        onClick={() => {
                          if (!notification.isRead) {
                            markNotificationAsRead(notification.id);
                          }
                        }}
                      >
                        <div className="notification-content">
                          <div className="notification-title">{notification.title}</div>
                          <div className="notification-message">{notification.message}</div>
                          <div className="notification-time">
                            {formatNotificationTime(notification.createdAt)}
                          </div>
                        </div>
                        {!notification.isRead && <div className="unread-indicator"></div>}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Rest of your component remains the same... */}
      {/* Search and Filter Section */}
      <div className="controls-section">
        <div className="search-filters">
          <input
            type="text"
            placeholder="Search by employee name, department, or goal..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />

          <select
            value={filters.department}
            onChange={(e) => setFilters({ ...filters, department: e.target.value })}
            className="filter-select"
          >
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.name}>{dept.name}</option>
            ))}
          </select>

          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="filter-select"
          >
            <option value="">All Status</option>
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
          </select>

          <select
            value={filters.priority}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
            className="filter-select"
          >
            <option value="">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        <div className="action-buttons">
          {canManageGoals && (
            <button onClick={() => setShowAddForm(true)} className="add-goal-btn">
              Add Goal
            </button>
          )}

          {canManageGoals && selectedGoals.length > 0 && (
            <div className="bulk-actions">
              <button
                onClick={() => handleBulkAction('complete')}
                className="bulk-btn complete-btn"
              >
                Mark Complete ({selectedGoals.length})
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="bulk-btn delete-btn"
              >
                Delete ({selectedGoals.length})
              </button>
            </div>
          )}
        </div>
      </div>

      {canManageGoals && showAddForm && (
        <div className="add-goal-form">
          <h3>Add New Goal</h3>
          
          <div className="form-group">
            <label>Select Employee:</label>
            <select
              value={newGoal.employeeId}
              onChange={e => setNewGoal({ ...newGoal, employeeId: e.target.value })}
              required
            >
              <option value="">Select Employee</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Goal Title:</label>
            <input
              type="text"
              placeholder="Enter goal title"
              value={newGoal.goalTitle}
              onChange={e => setNewGoal({ ...newGoal, goalTitle: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Target Date:</label>
            <input
              type="date"
              value={newGoal.deadline}
              onChange={e => setNewGoal({ ...newGoal, deadline: e.target.value })}
              required
            />
          </div>

          <div className="form-actions">
            <button onClick={handleAddGoal} className="submit-btn">Add Goal</button>
            <button onClick={() => setShowAddForm(false)} className="cancel-btn">Cancel</button>
          </div>
        </div>
      )}

      {/* Status Update Form */}
      {showStatusForm && selectedGoalForUpdate && (
        <div className="modal-overlay">
          <div className="status-update-form">
            <h3>Update Goal Status</h3>
            <p><strong>Goal:</strong> {selectedGoalForUpdate.goalTitle}</p>
            
            <div className="form-group">
              <label>Status:</label>
              <select
                value={statusUpdate.status}
                onChange={e => setStatusUpdate({ ...statusUpdate, status: e.target.value })}
              >
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
              </select>
            </div>

            <div className="form-group">
              <label>Progress (%):</label>
              <input
                type="number"
                value={statusUpdate.progress}
                onChange={e => setStatusUpdate({ ...statusUpdate, progress: e.target.value })}
                min="0"
                max="100"
              />
            </div>

            <div className="form-group">
              <label>Notes (optional):</label>
              <textarea
                value={statusUpdate.notes}
                onChange={e => setStatusUpdate({ ...statusUpdate, notes: e.target.value })}
                placeholder="Add any notes about your progress..."
                rows="3"
              />
            </div>

            <div className="form-actions">
              <button onClick={handleStatusUpdate} className="submit-btn">
                Update Status
              </button>
              <button 
                onClick={() => {
                  setShowStatusForm(false);
                  setSelectedGoalForUpdate(null);
                  setStatusUpdate({ status: '', progress: 0, notes: '' });
                }} 
                className="cancel-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="goals-table">
        <table>
          <thead>
            <tr>
              {canManageGoals && (
                <th>
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={selectedGoals.length === filteredGoals.length && filteredGoals.length > 0}
                  />
                </th>
              )}
              <th onClick={() => handleSort('employee')} className="sortable">
                Employee Name {sortConfig.key === 'employee' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('department')} className="sortable">
                Department {sortConfig.key === 'department' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('goalTitle')} className="sortable">
                Goal {sortConfig.key === 'goalTitle' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('deadline')} className="sortable">
                Target Date {sortConfig.key === 'deadline' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th>Priority</th>
              <th>Status</th>
              <th onClick={() => handleSort('progress')} className="sortable">
                Progress {sortConfig.key === 'progress' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th>Alerts</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredGoals.length === 0 ? (
              <tr>
                <td colSpan={canManageGoals ? "10" : "9"} style={{ textAlign: 'center' }}>
                  No goals available.
                </td>
              </tr>
            ) : (
              filteredGoals.map((goal, index) => (
                <tr key={goal.id || index}>
                  {canManageGoals && (
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedGoals.includes(goal.id)}
                        onChange={() => handleSelectGoal(goal.id)}
                      />
                    </td>
                  )}
                  <td>{goal.employee?.name || '—'}</td>
                  <td>{goal.employee?.department?.name || '—'}</td>
                  <td>{goal.goalTitle}</td>
                  <td>{goal.deadline ? new Date(goal.deadline).toLocaleDateString() : 'N/A'}</td>
                  <td>{getPriorityIndicator(goal.priority)}</td>
                  <td>{getStatusBadge(goal.status)}</td>
                  <td>{getProgressBar(goal.progress)}</td>
                  <td>{getDueDateAlert(goal.deadline, goal.status)}</td>
                  <td>
                    {canUpdateGoal(goal) && (
                      <button
                        onClick={() => openStatusForm(goal)}
                        className="update-status-btn"
                        title="Update Status & Progress"
                      >
                        📝
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeGoals;
