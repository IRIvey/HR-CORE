import React, { useState } from 'react';
import './Salary.css'; // 👈 Import CSS
import Sidebar from './sidebar';
const Salary = () => {
  const [formData, setFormData] = useState({
    department: 'IT',
    employee: '',
    basicSalary: '',
    allowances: '',
    deductions: '',
    payDate: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitting Salary Data:', formData);
  };

  return (
    <div className="salary-form-container">
      <h2 className="salary-form-title">Add New Salary</h2>
      <form onSubmit={handleSubmit} className="salary-form">
        
        <div className="salary-form-group">
          <label>Department</label>
          <select name="department" value={formData.department} onChange={handleChange}>
            <option value="IT">IT</option>
            <option value="HR">HR</option>
            <option value="Sales">Sales</option>
          </select>
        </div>

        <div className="salary-form-group">
          <label>Employee</label>
          <select name="employee" value={formData.employee} onChange={handleChange}>
            <option value="">Select Employee</option>
            <option value="John Doe">John Doe</option>
            <option value="Jane Smith">Jane Smith</option>
          </select>
        </div>

        <div className="salary-form-group">
          <label>Basic Salary</label>
          <input
            type="number"
            name="basicSalary"
            value={formData.basicSalary}
            onChange={handleChange}
            placeholder="Insert Salary"
          />
        </div>

        <div className="salary-form-group">
          <label>Allowances</label>
          <input
            type="number"
            name="allowances"
            value={formData.allowances}
            onChange={handleChange}
            placeholder="Monthly Allowances"
          />
        </div>

        <div className="salary-form-group">
          <label>Deductions</label>
          <input
            type="number"
            name="deductions"
            value={formData.deductions}
            onChange={handleChange}
            placeholder="Monthly Deductions"
          />
        </div>

        <div className="salary-form-group">
          <label>Pay Date</label>
          <input
            type="date"
            name="payDate"
            value={formData.payDate}
            onChange={handleChange}
          />
        </div>

        <button type="submit" className="salary-submit-btn">
          Add Salary
        </button>
      </form>
    </div>
  );
};

export default Salary;
