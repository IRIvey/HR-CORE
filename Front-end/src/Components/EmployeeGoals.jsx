
import React, { useState, useEffect } from 'react';
import './EmployeeGoals.css';

const EmployeeGoals = () => {
  const [goals, setGoals] = useState([]);
  const [filteredGoals, setFilteredGoals] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedGoals, setSelectedGoals] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
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

  // NOTE: renamed targetDate -> deadline
  const [newGoal, setNewGoal] = useState({
    employeeId: '',
    goalTitle: '',
    deadline: '',
    status: 'Not Started',
    progress: 0,
    priority: 'Medium'
  });

  useEffect(() => {
    fetchGoals();
    fetchEmployees();
  }, []);

  // Build/refresh departments after employees load (and also try API endpoint first)
  useEffect(() => {
    fetchDepartments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employees]);

  useEffect(() => {
    applyFiltersAndSearch();
  }, [goals, searchTerm, filters, sortConfig]);

  const fetchGoals = () => {
    fetch('/api/employee-goals')
      .then(res => res.json())
      .then(data => setGoals(Array.isArray(data) ? data : []))
      .catch(() => setGoals([]));
  };

  const fetchEmployees = () => {
    fetch('/api/employees')
      .then(res => res.json())
      .then(data => setEmployees(Array.isArray(data) ? data : []))
      .catch(() => setEmployees([]));
  };

  // Try server route first; if missing, derive from employees
  const fetchDepartments = async () => {
    try {
      const res = await fetch('/api/departments');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length) {
          setDepartments(data);
          return;
        }
      }
    } catch (_) {
      // ignore and fall back
    }
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
    String(goal.id).toLowerCase().includes(q) ||                  // ✅ search by ID
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

  const handleAddGoal = () => {
    // Validate required fields (note: using deadline now)
    if (newGoal.employeeId && newGoal.goalTitle && newGoal.deadline) {
      // Cast types for API / DB
      const payload = {
        ...newGoal,
        employeeId: Number(newGoal.employeeId),
        progress: Number(newGoal.progress)
      };

      fetch('/api/employee-goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
        .then(res => res.json())
        .then(() => {
          fetchGoals();
          setNewGoal({
            employeeId: '',
            goalTitle: '',
            deadline: '',
            status: 'Not Started',
            progress: 0,
            priority: 'Medium'
          });
          setShowAddForm(false);
        });
    }
  };

  const handleBulkAction = (action) => {
    if (selectedGoals.length === 0) return;

    fetch('/api/employee-goals/bulk', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goalIds: selectedGoals, action }),
    })
      .then(res => res.json())
      .then(() => {
        fetchGoals();
        setSelectedGoals([]);
      });
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
    // Added 'Pending' to match backend seeding; kept 'Overdue' only for styling if you ever set it
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

  return (
    <div className="goals-container">
      <h2 className="goals-title">Employee Goals</h2>

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
          <button onClick={() => setShowAddForm(true)} className="add-goal-btn">
            Add Goal
          </button>

          {selectedGoals.length > 0 && (
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

      {showAddForm && (
        <div className="add-goal-form">
          <select
            value={newGoal.employeeId}
            onChange={e => setNewGoal({ ...newGoal, employeeId: e.target.value })}
          >
            <option value="">Select Employee</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>
                {emp.name}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Goal Title"
            value={newGoal.goalTitle}
            onChange={e => setNewGoal({ ...newGoal, goalTitle: e.target.value })}
          />

          {/* NOTE: deadline field */}
          <input
            type="date"
            value={newGoal.deadline}
            onChange={e => setNewGoal({ ...newGoal, deadline: e.target.value })}
          />

          <select
            value={newGoal.status}
            onChange={e => setNewGoal({ ...newGoal, status: e.target.value })}
          >
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
          </select>

          <select
            value={newGoal.priority}
            onChange={e => setNewGoal({ ...newGoal, priority: e.target.value })}
          >
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <input
            type="number"
            value={newGoal.progress}
            onChange={e => setNewGoal({ ...newGoal, progress: e.target.value })}
            placeholder="Progress %"
            min="0"
            max="100"
          />

          <button onClick={handleAddGoal}>Submit</button>
          <button onClick={() => setShowAddForm(false)}>Cancel</button>
        </div>
      )}

      <div className="goals-table">
        <table>
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={selectedGoals.length === filteredGoals.length && filteredGoals.length > 0}
                />
              </th>
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
            </tr>
          </thead>
          <tbody>
            {filteredGoals.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center' }}>
                  No goals available.
                </td>
              </tr>
            ) : (
              filteredGoals.map((goal, index) => (
                <tr key={goal.id || index}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedGoals.includes(goal.id)}
                      onChange={() => handleSelectGoal(goal.id)}
                    />
                  </td>
                  <td>{goal.employee?.name || '—'}</td>
                  <td>{goal.employee?.department?.name || '—'}</td>
                  <td>{goal.goalTitle}</td>
                  <td>{goal.deadline ? new Date(goal.deadline).toLocaleDateString() : 'N/A'}</td>
                  <td>{getPriorityIndicator(goal.priority)}</td>
                  <td>{getStatusBadge(goal.status)}</td>
                  <td>{getProgressBar(goal.progress)}</td>
                  <td>{getDueDateAlert(goal.deadline, goal.status)}</td>
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
