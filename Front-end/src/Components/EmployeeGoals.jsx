
import React, { useState, useEffect } from 'react';
import './EmployeeGoals.css';

const EmployeeGoals = () => {
  const [goals, setGoals] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGoal, setNewGoal] = useState({
    employeeId: '',
    goalTitle: '',
    targetDate: '',
    status: 'Not Started',
    progress: 0,
  });

  useEffect(() => {
    fetch('/api/employee-goals')
      .then(res => res.json())
      .then(data => setGoals(data));

    
    fetch('/api/employees')
      .then(res => res.json())
      .then(data => setEmployees(data));
  }, []);


const handleAddGoal = () => {
  if (newGoal.employeeId && newGoal.goalTitle && newGoal.targetDate) {
    fetch('/api/employee-goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newGoal),
    })
      .then(res => res.json())
      .then(() => {
   
        fetch('/api/employee-goals')
          .then(res => res.json())
          .then(data => setGoals(data));

        setNewGoal({
          employeeId: '',
          goalTitle: '',
          targetDate: '',
          status: 'Not Started',
          progress: 0,
        });
        setShowAddForm(false);
      });
  }
};
  return (
    <div className="goals-container">
      <h2 className="goals-title">Employee Goals</h2>

      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => setShowAddForm(true)} className="add-goal-btn">
          Add Goal
        </button>
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

          <input
            type="date"
            value={newGoal.targetDate}
            onChange={e => setNewGoal({ ...newGoal, targetDate: e.target.value })}
          />

          <select
            value={newGoal.status}
            onChange={e => setNewGoal({ ...newGoal, status: e.target.value })}
          >
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
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
              <th>Employee Name</th>
              <th>Department</th>
              <th>Goal</th>
              <th>Target Date</th>
              <th>Status</th>
              <th>Progress</th>
            </tr>
          </thead>
          <tbody>
            {goals.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center' }}>
                  No goals available.
                </td>
              </tr>
            ) : (
              goals.map((goal, index) => (
                <tr key={goal.id || index}>
                  <td>{goal.employee?.name}</td>
                  <td>{goal.employee?.department?.name}</td>
                  <td>{goal.goalTitle}</td>
            <td>{goal.deadline ? new Date(goal.deadline).toLocaleDateString() : 'N/A'}</td>

                  <td>{goal.status}</td>
                  <td>{goal.progress}%</td>
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
