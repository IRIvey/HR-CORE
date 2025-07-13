import React, { useState, useEffect } from 'react';

const EditEmployee = ({ show, onClose, employee, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    position: '',
    salary: '',
    status: '',
    joinDate: '',
    age: '',
    experience: ''
  });

  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name || '',
        email: employee.email || '',
        department: employee.department?.name || '',
        position: employee.position || '',
        salary: employee.salary || '',
        status: employee.status || 'Active',
        joinDate: employee.joinDate ? employee.joinDate.split('T')[0] : '',
        age: employee.age || '',
        experience: employee.experience || ''
      });
    }
  }, [employee]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await fetch(`/api/employees/${employee.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          salary: parseFloat(formData.salary),
          age: parseInt(formData.age),
          experience: parseInt(formData.experience)
        })
      });

      onUpdate();  // Refresh list
      onClose();
    } catch (err) {
      console.error('Failed to update employee:', err);
    }
  };

  if (!show) return null;

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
          <h2>Edit Employee</h2>
          <button onClick={onClose} style={{
            fontSize: '1.5rem', background: 'none', border: 'none', cursor: 'pointer'
          }}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <input name="name" value={formData.name} onChange={handleChange} required placeholder="Name *" style={{ flex: 1, padding: '0.5rem' }} />
            <input name="email" value={formData.email} onChange={handleChange} required type="email" placeholder="Email *" style={{ flex: 1, padding: '0.5rem' }} />
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <select name="department" value={formData.department} onChange={handleChange} required style={{ flex: 1, padding: '0.5rem' }}>
              <option value="">Select Department *</option>
              <option value="HR">HR</option>
              <option value="Design">Design</option>
              <option value="Engineering">Engineering</option>
            </select>
            <input name="position" value={formData.position} onChange={handleChange} required placeholder="Position *" style={{ flex: 1, padding: '0.5rem' }} />
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <input name="salary" value={formData.salary} onChange={handleChange} required placeholder="Salary *" type="number" style={{ flex: 1, padding: '0.5rem' }} />
            <select name="status" value={formData.status} onChange={handleChange} required style={{ flex: 1, padding: '0.5rem' }}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <input name="joinDate" value={formData.joinDate} onChange={handleChange} required type="date" style={{ flex: 1, padding: '0.5rem' }} />
            <input name="age" value={formData.age} onChange={handleChange} required placeholder="Age *" type="number" style={{ flex: 1, padding: '0.5rem' }} />
            <input name="experience" value={formData.experience} onChange={handleChange} required placeholder="Experience (years) *" type="number" style={{ flex: 1, padding: '0.5rem' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button type="button" onClick={onClose} style={{ padding: '0.5rem 1rem' }}>Cancel</button>
            <button type="submit" style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#008075', color: 'white',
              border: 'none', borderRadius: '4px'
            }}>
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEmployee;
