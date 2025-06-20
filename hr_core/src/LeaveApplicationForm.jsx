import React, { useState } from 'react';
import { Calendar, FileText } from 'lucide-react';


const LeaveApplicationForm = () => {
  const [formData, setFormData] = useState({
    leaveType: 'Annual Leave',
    startDate: '',
    endDate: '',
    resumptionDate: '',
    reason: '',
    handoverDocument: null
  });

  const [errors, setErrors] = useState({});

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      padding: '2rem 1rem',
    },
    card: {
      maxWidth: '42rem',
      margin: '0 auto',
      backgroundColor: 'white',
      borderRadius: '0.5rem',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    },
    header: {
      backgroundColor: '#1f2937',
      color: 'white',
      padding: '1.5rem',
      borderTopLeftRadius: '0.5rem',
      borderTopRightRadius: '0.5rem',
    },
    headerContent: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
    },
    title: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      margin: 0,
    },
    subtitle: {
      color: '#d1d5db',
      marginTop: '0.5rem',
      margin: 0,
    },
    form: {
      padding: '1.5rem',
    },
    fieldGroup: {
      marginBottom: '1.5rem',
    },
    label: {
      display: 'block',
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#374151',
      marginBottom: '0.5rem',
    },
    select: {
      width: '100%',
      padding: '0.75rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.375rem',
      backgroundColor: '#dbeafe',
      fontSize: '1rem',
      outline: 'none',
      transition: 'all 0.2s',
    },
    selectFocus: {
      borderColor: '#3b82f6',
      boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.5)',
    },
    gridContainer: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '1rem',
      '@media (min-width: 768px)': {
        gridTemplateColumns: '1fr 1fr',
      },
    },
    inputWrapper: {
      position: 'relative',
    },
    input: {
      width: '100%',
      padding: '0.75rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.375rem',
      backgroundColor: '#dbeafe',
      fontSize: '1rem',
      outline: 'none',
      transition: 'all 0.2s',
      boxSizing: 'border-box',
    },
    inputError: {
      borderColor: '#ef4444',
    },
    inputFocus: {
      borderColor: '#3b82f6',
      boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.5)',
    },
    icon: {
      position: 'absolute',
      right: '0.75rem',
      top: '0.75rem',
      width: '1.25rem',
      height: '1.25rem',
      color: '#9ca3af',
      pointerEvents: 'none',
    },
    errorText: {
      color: '#ef4444',
      fontSize: '0.875rem',
      marginTop: '0.25rem',
    },
    durationDisplay: {
      width: '100%',
      padding: '0.75rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.375rem',
      backgroundColor: '#dbeafe',
      color: '#374151',
      boxSizing: 'border-box',
    },
    helperText: {
      fontSize: '0.75rem',
      color: '#6b7280',
      marginTop: '0.25rem',
    },
    textarea: {
      width: '100%',
      padding: '0.75rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.375rem',
      backgroundColor: '#dbeafe',
      fontSize: '1rem',
      outline: 'none',
      transition: 'all 0.2s',
      resize: 'none',
      fontFamily: 'inherit',
      boxSizing: 'border-box',
    },
    fileUploadWrapper: {
      position: 'relative',
    },
    fileInput: {
      display: 'none',
    },
    fileLabel: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      padding: '0.75rem',
      border: '2px dashed #d1d5db',
      borderRadius: '0.375rem',
      backgroundColor: '#dbeafe',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      textAlign: 'center',
      boxSizing: 'border-box',
    },
    fileLabelHover: {
      backgroundColor: '#bfdbfe',
    },
    fileContent: {
      textAlign: 'center',
    },
    fileIcon: {
      width: '2rem',
      height: '2rem',
      color: '#9ca3af',
      margin: '0 auto 0.5rem',
    },
    buttonContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      paddingTop: '1rem',
      '@media (min-width: 640px)': {
        flexDirection: 'row',
      },
    },
    submitButton: {
      flex: 1,
      backgroundColor: '#16a34a',
      color: 'white',
      padding: '0.75rem 1.5rem',
      borderRadius: '0.375rem',
      fontWeight: '500',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s',
      fontSize: '1rem',
    },
    submitButtonHover: {
      backgroundColor: '#15803d',
    },
    resetButton: {
      flex: 1,
      border: '2px solid #ef4444',
      color: '#ef4444',
      backgroundColor: 'transparent',
      padding: '0.75rem 1.5rem',
      borderRadius: '0.375rem',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s',
      fontSize: '1rem',
    },
    resetButtonHover: {
      backgroundColor: '#fef2f2',
    },
  };

  const calculateDuration = () => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const timeDiff = end.getTime() - start.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
      return daysDiff > 0 ? daysDiff : 0;
    }
    return 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({
      ...prev,
      handoverDocument: file
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';
    if (!formData.resumptionDate) newErrors.resumptionDate = 'Resumption date is required';
    if (!formData.reason.trim()) newErrors.reason = 'Reason for leave is required';
    
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (start > end) {
        newErrors.endDate = 'End date must be after start date';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      console.log('Form submitted:', formData);
      alert('Leave application submitted successfully!');
    }
  };

  const handleReset = () => {
    setFormData({
      leaveType: 'Annual Leave',
      startDate: '',
      endDate: '',
      resumptionDate: '',
      reason: '',
      handoverDocument: null
    });
    setErrors({});
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerContent}>
            <FileText style={{ width: '1.5rem', height: '1.5rem' }} />
            <h1 style={styles.title}>Leave Application</h1>
          </div>
          <p style={styles.subtitle}>Fill the required fields below to apply for annual leave.</p>
        </div>

        {/* Form */}
        <div style={styles.form}>
          {/* Leave Type */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>
              Leave Type
            </label>
            <select
              name="leaveType"
              value={formData.leaveType}
              onChange={handleInputChange}
              style={styles.select}
            >
              <option value="Annual Leave">Annual Leave</option>
              <option value="Sick Leave">Sick Leave</option>
              <option value="Maternity Leave">Maternity Leave</option>
              <option value="Paternity Leave">Paternity Leave</option>
              <option value="Emergency Leave">Emergency Leave</option>
            </select>
          </div>

          {/* Date Fields */}
          <div style={styles.fieldGroup}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={styles.label}>
                  Start Date
                </label>
                <div style={styles.inputWrapper}>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    style={{
                      ...styles.input,
                      ...(errors.startDate ? styles.inputError : {})
                    }}
                  />
                  <Calendar style={styles.icon} />
                </div>
                {errors.startDate && <p style={styles.errorText}>{errors.startDate}</p>}
              </div>

              <div>
                <label style={styles.label}>
                  End Date
                </label>
                <div style={styles.inputWrapper}>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    style={{
                      ...styles.input,
                      ...(errors.endDate ? styles.inputError : {})
                    }}
                  />
                  <Calendar style={styles.icon} />
                </div>
                {errors.endDate && <p style={styles.errorText}>{errors.endDate}</p>}
              </div>
            </div>
          </div>

          {/* Duration Display and Resumption Date */}
          <div style={styles.fieldGroup}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={styles.label}>
                  Duration
                </label>
                <div style={styles.durationDisplay}>
                  {calculateDuration() > 0 ? (
                    <span style={{ fontWeight: '500' }}>
                      {calculateDuration()} {calculateDuration() === 1 ? 'day' : 'days'}
                    </span>
                  ) : (
                    <span style={{ color: '#6b7280' }}>Select start and end dates</span>
                  )}
                </div>
                <p style={styles.helperText}>Duration is calculated automatically from your selected dates</p>
              </div>

              <div>
                <label style={styles.label}>
                  Resumption Date
                </label>
                <div style={styles.inputWrapper}>
                  <input
                    type="date"
                    name="resumptionDate"
                    value={formData.resumptionDate}
                    onChange={handleInputChange}
                    style={{
                      ...styles.input,
                      ...(errors.resumptionDate ? styles.inputError : {})
                    }}
                  />
                  <Calendar style={styles.icon} />
                </div>
                {errors.resumptionDate && <p style={styles.errorText}>{errors.resumptionDate}</p>}
              </div>
            </div>
          </div>

          {/* Reason for Leave */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>
              Reason for leave
            </label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleInputChange}
              rows={4}
              placeholder="Please provide a detailed reason for your leave..."
              style={{
                ...styles.textarea,
                ...(errors.reason ? styles.inputError : {})
              }}
            />
            {errors.reason && <p style={styles.errorText}>{errors.reason}</p>}
          </div>

          {/* File Upload */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>
              Attach handover document (pdf, jpg, docx or any other format)
            </label>
            <div style={styles.fileUploadWrapper}>
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.txt"
                style={styles.fileInput}
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                style={styles.fileLabel}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = styles.fileLabelHover.backgroundColor;
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = styles.fileLabel.backgroundColor;
                }}
              >
                <div style={styles.fileContent}>
                  <FileText style={styles.fileIcon} />
                  <span style={{ color: '#4b5563' }}>
                    {formData.handoverDocument ? formData.handoverDocument.name : 'Choose File'}
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingTop: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: window.innerWidth >= 640 ? 'row' : 'column', gap: '1rem' }}>
              <button
                type="button"
                onClick={handleSubmit}
                style={styles.submitButton}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = styles.submitButtonHover.backgroundColor;
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = styles.submitButton.backgroundColor;
                }}
              >
                Submit
              </button>
              <button
                type="button"
                onClick={handleReset}
                style={styles.resetButton}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = styles.resetButtonHover.backgroundColor;
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = styles.resetButton.backgroundColor;
                }}
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveApplicationForm;