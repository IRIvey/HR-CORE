import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './EmployeeList.css';
import { FaPlus } from 'react-icons/fa';

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/employees')
      .then(res => res.json())
      .then(data => setEmployees(data))
      .catch(err => console.error('Failed to fetch employees:', err));
  }, []);

  const handleView = (id) => navigate(`/employee/${id}`);
  const handleEdit = (id) => alert(`Editing employee ${id}`);
  const handleDelete = (id) => alert(`Deleting employee ${id}`);
  const handleAddEmployee = () => setShowAddModal(true);

  const handleCloseModal = () => setShowAddModal(false);

  const handleAddEmployeeSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          salary: parseFloat(payload.salary),
          age: parseInt(payload.age),
          experience: parseInt(payload.experience)
        })
      });

      if (!response.ok) throw new Error('Failed to add employee');

      const updatedList = await fetch('/api/employees').then(res => res.json());
      setEmployees(updatedList);

      setShowAddModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="employee-list-container">
      <div className="employee-list-header">
        <h2>Add Employees</h2>
        <button className="add-btn" onClick={handleAddEmployee}>
          <FaPlus style={{ marginRight: '8px' }} />
          Add
        </button>
      </div>

      <div className="employee-list-title">
        <h2>Employee List</h2>
      </div>

      <table className="employee-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Department</th>
            <th>Joining Date</th>
            <th className="action-column">Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map(emp => (
            <tr key={emp.id}>
              <td>{emp.name}</td>
              <td>{emp.department?.name || 'N/A'}</td>
              <td>{emp.joinDate?.split('T')[0] || 'N/A'}</td>
              <td className="action-column">
                <button onClick={() => handleView(emp.id)} className="view-btn">View</button>
                <button onClick={() => handleEdit(emp.id)} className="edit-btn">Edit</button>
                <button onClick={() => handleDelete(emp.id)} className="delete-btn">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal */}
      {showAddModal && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.3)', display: 'flex',
          justifyContent: 'center', alignItems: 'center'
        }}>
          <div className="modal-content" style={{
            backgroundColor: 'white', padding: '2rem', borderRadius: '8px',
            width: '500px', maxWidth: '90%'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h2>Add New Employee</h2>
              <button onClick={handleCloseModal} style={{
                fontSize: '1.5rem', background: 'none', border: 'none', cursor: 'pointer'
              }}>&times;</button>
            </div>

            <form onSubmit={handleAddEmployeeSubmit}>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <input name="name" required placeholder="Name *" style={{ flex: 1, padding: '0.5rem' }} />
                <input name="email" required type="email" placeholder="Email *" style={{ flex: 1, padding: '0.5rem' }} />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <select name="department" required style={{ flex: 1, padding: '0.5rem' }}>
                  <option value="">Select Department *</option>
                  <option value="HR">HR</option>
                  <option value="Design">Design</option>
                  <option value="Engineering">Engineering</option>
                </select>
                <input name="position" required placeholder="Position *" style={{ flex: 1, padding: '0.5rem' }} />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <input name="salary" required placeholder="Salary *" type="number" style={{ flex: 1, padding: '0.5rem' }} />
                <select name="status" required style={{ flex: 1, padding: '0.5rem' }}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <input name="joinDate" required type="date" style={{ flex: 1, padding: '0.5rem' }} />
                <input name="age" required placeholder="Age *" type="number" style={{ flex: 1, padding: '0.5rem' }} />
                <input name="experience" required placeholder="Experience (years) *" type="number" style={{ flex: 1, padding: '0.5rem' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" onClick={handleCloseModal} style={{ padding: '0.5rem 1rem' }}>Cancel</button>
                <button type="submit" style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#008075', color: 'white',
                  border: 'none', borderRadius: '4px'
                }}>
                  Add Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeList;
