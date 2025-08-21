

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './EmployeeList.css';
import { FaPlus } from 'react-icons/fa';

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [role, setRole] = useState(null);     // 'ADMIN' | 'TEAM_LEAD' | 'EMPLOYEE' | null
  const [authChecked, setAuthChecked] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    // 1) get auth status (role)
    (async () => {
      try {
   const r = await fetch('http://localhost:5000/auth/status', { credentials: 'include' });
const j = await r.json();

        if (!j.loggedIn) {
          navigate('/login');
          return;
        }
        setRole(j.user?.role || null);
        setAuthChecked(true);
      } catch {
        navigate('/login');
      }
    })();
  }, [navigate]);

  useEffect(() => {
    if (authChecked) fetchEmployees();
  }, [authChecked]);

  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/employees', { credentials: 'include' });
      if (res.status === 401) return navigate('/login');
      if (res.status === 403) return alert('Forbidden');
      const data = await res.json();
      setEmployees(data);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
    }
  };

  const handleView = (id) => navigate(`/employee/${id}`);

  const handleEdit = async (id) => {
    try {
      const res = await fetch(`/api/employees/${id}`, { credentials: 'include' });
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
        method: 'DELETE',
        credentials: 'include'
      });
      if (!response.ok) {
        const j = await response.json().catch(() => ({}));
        throw new Error(j?.error || 'Delete failed');
      }
      setEmployees(prev => prev.filter(emp => emp.id !== id));
    } catch (err) {
      console.error('Failed to delete employee:', err);
      alert(err.message || 'Failed to delete employee.');
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
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          salary: parseFloat(payload.salary),
          age: parseInt(payload.age),
          experience: parseInt(payload.experience)
        })
      });

      const result = await response.json();
      if (!response.ok) {
        alert(result.error || 'Failed to add employee');
        return;
      }

      await fetchEmployees();
      setShowAddModal(false);
    } catch (err) {
      console.error('Add error:', err);
      alert('An unexpected error occurred while adding employee.');
    }
  };

  const handleEditEmployeeSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch(`/api/employees/${editingEmployee.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          salary: parseFloat(payload.salary),
          age: parseInt(payload.age),
          experience: parseInt(payload.experience)
        })
      });

      const result = await response.json();
      if (!response.ok) {
        alert(result.error || 'Failed to update employee');
        return;
      }

      await fetchEmployees();
      setShowEditModal(false);
      setEditingEmployee(null);
    } catch (err) {
      console.error('Update error:', err);
      alert('Failed to update employee.');
    }
  };

  // guard while we check auth state
  if (!authChecked) return null;

  const isAdmin = role === 'ADMIN';

  return (
    <div className="employee-list-container">
      <div className="employee-list-header">
        {isAdmin && (
          <button className="add-btn" onClick={handleAddEmployee}>
            <FaPlus style={{ marginRight: '8px' }} /> Add
          </button>
        )}
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

                {isAdmin && (
                  <>
                    <button onClick={() => handleEdit(emp.id)} className="edit-btn">Edit</button>
                    <button onClick={() => handleDelete(emp.id)} className="delete-btn">Delete</button>
                  </>
                )}
                {/* TEAM_LEAD / EMPLOYEE: only View (and Search elsewhere) */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Add Modal (Admin only) */}
      {isAdmin && showAddModal && (
        <ModalForm
          title="Add New Employee"
          onSubmit={handleAddEmployeeSubmit}
          onClose={handleCloseModal}
        />
      )}

      {/* Edit Modal (Admin only) */}
      {isAdmin && showEditModal && editingEmployee && (
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
        backgroundColor: 'white', padding: '2.5rem', borderRadius: '10px',
        width: '650px', maxWidth: '98%'
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
            {/* You can switch to departmentId if your backend prefers ids */}
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

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <input name="joinDate" required type="date" defaultValue={initialData?.joinDate?.split('T')[0]} style={{ flex: 0.3, padding: '0.5rem' }} />
            <input name="age" required placeholder="Age *" type="number" defaultValue={initialData?.age} style={{ flex: 0.3, padding: '0.5rem' }} />
            <input name="experience" required placeholder="Experience (years) *" type="number" defaultValue={initialData?.experience} style={{ flex: 0.3, padding: '0.5rem' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button type="button" onClick={onClose} style={{ padding: '0.5rem 1rem' }}>Cancel</button>
            <button type="submit" style={{
              padding: '0.5rem 1.2rem',
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
