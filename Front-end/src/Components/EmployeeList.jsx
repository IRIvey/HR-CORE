import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './EmployeeList.css';
import { FaPlus } from 'react-icons/fa';

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/employees')
      .then(res => res.json())
      .then(data => setEmployees(data))
      .catch(err => console.error('Failed to fetch employees:', err));
  }, []);

  const handleView = (id) => navigate(`/employee/${id}`);

  const handleEdit = async (id) => {
    try {
      const res = await fetch(`/api/employees/${id}`);
      if (!res.ok) throw new Error('Failed to fetch employee');
      const data = await res.json();
      setEditingEmployee(data);
      setShowEditModal(true);
    } catch (err) {
      console.error(err);
      alert('Failed to load employee for editing.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) return;

    try {
      const response = await fetch(`/api/employees/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Delete failed');

      setEmployees(prev => prev.filter(emp => emp.id !== id));
    } catch (err) {
      console.error('Failed to delete employee:', err);
      alert('Failed to delete employee.');
    }
  };

  const handleAddEmployee = () => setShowAddModal(true);
  const handleCloseModal = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setEditingEmployee(null);
  };

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

  const handleEditEmployeeSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch(`/api/employees/${editingEmployee.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          salary: parseFloat(payload.salary),
          age: parseInt(payload.age),
          experience: parseInt(payload.experience)
        })
      });

      if (!response.ok) throw new Error('Failed to update employee');

      // update local list
      setEmployees(prev => prev.map(emp =>
        emp.id === editingEmployee.id ? { ...emp, ...payload, salary: parseFloat(payload.salary), age: parseInt(payload.age), experience: parseInt(payload.experience), department: { name: payload.department } } : emp
      ));

      setShowEditModal(false);
      setEditingEmployee(null);
    } catch (err) {
      console.error(err);
      alert('Failed to update employee.');
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

      {/* Add Modal */}
      {showAddModal && (
        <ModalForm
          title="Add New Employee"
          onSubmit={handleAddEmployeeSubmit}
          onClose={handleCloseModal}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && editingEmployee && (
        <ModalForm
          title="Edit Employee"
          onSubmit={handleEditEmployeeSubmit}
          onClose={handleCloseModal}
          initialData={editingEmployee}
        />
      )}
    </div>
  );
};

const ModalForm = ({ title, onSubmit, onClose, initialData }) => {
  return (
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
          <h2>{title}</h2>
          <button onClick={onClose} style={{
            fontSize: '1.5rem', background: 'none', border: 'none', cursor: 'pointer'
          }}>&times;</button>
        </div>

        <form onSubmit={onSubmit}>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <input name="name" required placeholder="Name *" defaultValue={initialData?.name} style={{ flex: 1, padding: '0.5rem' }} />
            <input name="email" required type="email" placeholder="Email *" defaultValue={initialData?.email} style={{ flex: 1, padding: '0.5rem' }} />
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <select name="department" required defaultValue={initialData?.department?.name} style={{ flex: 1, padding: '0.5rem' }}>
              <option value="">Select Department *</option>
              <option value="HR">HR</option>
              <option value="Design">Design</option>
              <option value="Engineering">Engineering</option>
            </select>
            <input name="position" required placeholder="Position *" defaultValue={initialData?.position} style={{ flex: 1, padding: '0.5rem' }} />
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <input name="salary" required placeholder="Salary *" type="number" defaultValue={initialData?.salary} style={{ flex: 1, padding: '0.5rem' }} />
            <select name="status" required defaultValue={initialData?.status} style={{ flex: 1, padding: '0.5rem' }}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <input name="joinDate" required type="date" defaultValue={initialData?.joinDate?.split('T')[0]} style={{ flex: 1, padding: '0.5rem' }} />
            <input name="age" required placeholder="Age *" type="number" defaultValue={initialData?.age} style={{ flex: 1, padding: '0.5rem' }} />
            <input name="experience" required placeholder="Experience (years) *" type="number" defaultValue={initialData?.experience} style={{ flex: 1, padding: '0.5rem' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button type="button" onClick={onClose} style={{ padding: '0.5rem 1rem' }}>Cancel</button>
            <button type="submit" style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#008075', color: 'white',
              border: 'none', borderRadius: '4px'
            }}>
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeList;
