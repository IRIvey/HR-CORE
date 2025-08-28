
import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  DollarSign,
  BarChart3,
  Download,
  Plus,
  FileText,
  RefreshCw,
  CheckCircle,
  XCircle,
  Loader,
  Trash2,
  AlertCircle,
  Filter,
  Users,
  Building2,
  TrendingUp,
  Eye,
  Settings
} from 'lucide-react';

const Reporting = () => {
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('generate');

  // Enhanced generator form state
  const [generatorForm, setGeneratorForm] = useState({
    reportType: 'ATTENDANCE_SUMMARY',
    title: '',
    description: '',
    parameters: {
      dateFrom: '',
      dateTo: '',
      departmentId: '',
      employeeId: '',
      includeDetails: true,
      groupBy: 'department'
    },
    adminId: 1 // Get from auth context
  });

  // Filters for reports list
  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    status: 'all',
    dateRange: 'all'
  });

  // Mock data for departments and employees (you'd fetch these from your API)
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);

  // Fetch initial data
  useEffect(() => {
    fetchReports();
    fetchStats();
    fetchDepartments();
    fetchEmployees();
  }, []);

  // Auto-refresh every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeTab === 'history') {
        fetchReports();
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [activeTab]);

  const fetchReports = async () => {
    try {
      const response = await fetch('/api/reports', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setReports(data);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/reports/stats', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/departments', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setDepartments(data);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/employees', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setEmployees(data);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const handleGenerateReport = async () => {
     console.log('Form data being sent:', generatorForm); 
    setLoading(true);
    setError('');
    setSuccess('');

    // Validation
    if (!generatorForm.parameters.dateFrom || !generatorForm.parameters.dateTo) {
      setError('Please select both start and end dates');
      setLoading(false);
      return;
    }

    if (new Date(generatorForm.parameters.dateFrom) > new Date(generatorForm.parameters.dateTo)) {
      setError('Start date cannot be after end date');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(generatorForm),
      });

      if (response.ok) {
        const result = await response.json();
        setSuccess(`Report generation started successfully! Report ID: ${result.reportId}`);
        
        // Reset form
        setGeneratorForm({
          ...generatorForm,
          title: '',
          description: '',
          parameters: {
            dateFrom: '',
            dateTo: '',
            departmentId: '',
            employeeId: '',
            includeDetails: true,
            groupBy: 'department'
          }
        });
        
        // Switch to history tab
        setTimeout(() => {
          setActiveTab('history');
          fetchReports();
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to generate report');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      setError('Failed to generate report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (reportId) => {
    try {
      const response = await fetch(`/api/reports/${reportId}/download`, {
        credentials: 'include'
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `report_${reportId}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      } else {
        setError('Failed to download report');
      }
    } catch (error) {
      console.error('Error downloading report:', error);
      setError('Failed to download report');
    }
  };

  const handleDelete = async (reportId) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;
    
    try {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (response.ok) {
        fetchReports();
        setSuccess('Report deleted successfully');
      } else {
        setError('Failed to delete report');
      }
    } catch (error) {
      console.error('Error deleting report:', error);
      setError('Failed to delete report');
    }
  };

  const reportTypes = [
    {
      value: 'ATTENDANCE_SUMMARY',
      label: 'Attendance Summary',
      description: 'Comprehensive attendance analysis with working hours, overtime, and trends',
      icon: Calendar,
      color: 'blue'
    },
    {
      value: 'LEAVE_SUMMARY',
      label: 'Leave Analysis',
      description: 'Leave requests, balances, usage patterns, and approval statistics',
      icon: Clock,
      color: 'green'
    },
    {
      value: 'PAYROLL_SUMMARY',
      label: 'Payroll Report',
      description: 'Detailed salary breakdowns, overtime calculations, and compensation analysis',
      icon: DollarSign,
      color: 'yellow'
    },
    {
      value: 'EMPLOYEE_PERFORMANCE',
      label: 'Performance Review',
      description: 'Employee performance ratings, goal tracking, and review summaries',
      icon: TrendingUp,
      color: 'purple'
    },
    {
      value: 'DEPARTMENT_ANALYTICS',
      label: 'Department Analytics',
      description: 'Department-wise productivity metrics and resource utilization',
      icon: Building2,
      color: 'indigo'
    },
    {
      value: 'MONTHLY_OVERVIEW',
      label: 'Monthly Overview',
      description: 'Complete monthly HR overview with key metrics and insights',
      icon: BarChart3,
      color: 'red'
    }
  ];

  const getStatusBadge = (status) => {
    const configs = {
      COMPLETED: { color: '#16a34a', bgColor: '#dcfce7', icon: CheckCircle, text: 'Completed' },
      PENDING: { color: '#eab308', bgColor: '#fef3c7', icon: Clock, text: 'Pending' },
      GENERATING: { color: '#2563eb', bgColor: '#dbeafe', icon: RefreshCw, text: 'Generating' },
      FAILED: { color: '#dc2626', bgColor: '#fee2e2', icon: XCircle, text: 'Failed' }
    };

    const config = configs[status] || configs.PENDING;
    const Icon = config.icon;

    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 8px',
        borderRadius: '9999px',
        fontSize: '12px',
        fontWeight: '500',
        backgroundColor: config.bgColor,
        color: config.color
      }}>
        <Icon size={12} style={{ 
          marginRight: '4px',
          animation: status === 'GENERATING' ? 'spin 1s linear infinite' : 'none'
        }} />
        {config.text}
      </span>
    );
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(filters.search.toLowerCase());
    const matchesType = filters.type === 'all' || report.reportType === filters.type;
    const matchesStatus = filters.status === 'all' || report.status === filters.status.toUpperCase();
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      
      <div className="reporting-container" style={{
        minHeight: '100vh',
        background: '#f9fafb',
        padding: '24px'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{
              fontSize: '30px',
              fontWeight: '700',
              color: '#0c3d4a',
              margin: '0 0 8px 0'
            }}>
              Report Generation Center
            </h1>
            <p style={{
              color: '#555',
              margin: '0 0 32px 0'
            }}>
              Generate comprehensive HR reports with advanced analytics
            </p>
          </div>

          {/* Alerts */}
          {error && (
            <div style={{
              marginBottom: '24px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#b91c1c',
              padding: '12px 16px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={16} />
              {error}
              <button 
                onClick={() => setError('')}
                style={{
                  marginLeft: 'auto',
                  background: 'none',
                  border: 'none',
                  color: '#ef4444',
                  cursor: 'pointer',
                  fontSize: '20px',
                  opacity: 0.6
                }}
              >
                ×
              </button>
            </div>
          )}

          {success && (
            <div style={{
              marginBottom: '24px',
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              color: '#16a34a',
              padding: '12px 16px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <CheckCircle size={16} />
              {success}
              <button 
                onClick={() => setSuccess('')}
                style={{
                  marginLeft: 'auto',
                  background: 'none',
                  border: 'none',
                  color: '#22c55e',
                  cursor: 'pointer',
                  fontSize: '20px',
                  opacity: 0.6
                }}
              >
                ×
              </button>
            </div>
          )}

          {/* Stats Overview */}
          <div className="stats-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '24px',
            marginBottom: '32px'
          }}>
            <div className="stat-card" style={{
              background: '#fff',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', margin: '0 0 4px 0' }}>
                    Total Reports
                  </p>
                  <p style={{ fontSize: '30px', fontWeight: '700', color: '#0c3d4a', margin: 0 }}>
                    {stats.totalReports || 0}
                  </p>
                </div>
                <FileText style={{ height: '32px', width: '32px', color: '#2563eb' }} />
              </div>
            </div>
            
            <div className="stat-card" style={{
              background: '#fff',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', margin: '0 0 4px 0' }}>
                    This Month
                  </p>
                  <p style={{ fontSize: '30px', fontWeight: '700', color: '#0c3d4a', margin: 0 }}>
                    {stats.monthlyReports || 0}
                  </p>
                </div>
                <Calendar style={{ height: '32px', width: '32px', color: '#16a34a' }} />
              </div>
            </div>

            <div className="stat-card" style={{
              background: '#fff',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', margin: '0 0 4px 0' }}>
                    Processing
                  </p>
                  <p style={{ fontSize: '30px', fontWeight: '700', color: '#0c3d4a', margin: 0 }}>
                    {stats.processingReports || 0}
                  </p>
                </div>
                <RefreshCw style={{ 
                  height: '32px', 
                  width: '32px', 
                  color: '#eab308',
                  animation: 'spin 2s linear infinite'
                }} />
              </div>
            </div>

            <div className="stat-card" style={{
              background: '#fff',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', margin: '0 0 4px 0' }}>
                    Downloads
                  </p>
                  <p style={{ fontSize: '30px', fontWeight: '700', color: '#0c3d4a', margin: 0 }}>
                    {stats.totalDownloads || 0}
                  </p>
                </div>
                <Download style={{ height: '32px', width: '32px', color: '#8b5cf6' }} />
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb',
            marginBottom: '24px'
          }}>
            <div style={{ borderBottom: '1px solid #e5e7eb' }}>
              <nav style={{ display: 'flex', padding: '0 24px' }}>
                <button
                  onClick={() => setActiveTab('generate')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '16px 4px',
                    marginRight: '32px',
                    border: 'none',
                    background: 'none',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    borderBottom: `2px solid ${activeTab === 'generate' ? '#2563eb' : 'transparent'}`,
                    color: activeTab === 'generate' ? '#2563eb' : '#6b7280'
                  }}
                >
                  <Plus size={16} style={{ marginRight: '8px' }} />
                  Generate Report
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '16px 4px',
                    marginRight: '32px',
                    border: 'none',
                    background: 'none',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    borderBottom: `2px solid ${activeTab === 'history' ? '#2563eb' : 'transparent'}`,
                    color: activeTab === 'history' ? '#2563eb' : '#6b7280'
                  }}
                >
                  <FileText size={16} style={{ marginRight: '8px' }} />
                  Report History
                </button>
              </nav>
            </div>

            {/* Generate Report Tab */}
            {activeTab === 'generate' && (
              <div style={{ padding: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {/* Report Type Selection */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: '16px'
                    }}>
                      Select Report Type
                    </label>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                      gap: '16px'
                    }}>
                      {reportTypes.map((type) => {
                        const Icon = type.icon;
                        const isSelected = generatorForm.reportType === type.value;
                        return (
                          <div
                            key={type.value}
                            style={{
                              position: 'relative',
                              padding: '16px',
                              border: `2px solid ${isSelected ? '#2563eb' : '#e5e7eb'}`,
                              borderRadius: '8px',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              backgroundColor: isSelected ? '#eff6ff' : 'transparent'
                            }}
                            onClick={() => setGeneratorForm({...generatorForm, reportType: type.value})}
                          >
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                              <Icon style={{
                                height: '24px',
                                width: '24px',
                                color: '#2563eb',
                                flexShrink: 0,
                                marginTop: '2px'
                              }} />
                              <div>
                                <h3 style={{
                                  fontWeight: '500',
                                  color: '#111827',
                                  margin: '0 0 4px 0',
                                  fontSize: '16px'
                                }}>
                                  {type.label}
                                </h3>
                                <p style={{
                                  fontSize: '14px',
                                  color: '#6b7280',
                                  margin: 0,
                                  lineHeight: '1.4'
                                }}>
                                  {type.description}
                                </p>
                              </div>
                            </div>
                            {isSelected && (
                              <CheckCircle style={{
                                position: 'absolute',
                                top: '8px',
                                right: '8px',
                                height: '20px',
                                width: '20px',
                                color: '#2563eb'
                              }} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Report Details */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '24px'
                  }}>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#374151',
                        marginBottom: '8px'
                      }}>
                        Report Title
                      </label>
                      <input
                        type="text"
                        value={generatorForm.title}
                        onChange={(e) => setGeneratorForm({...generatorForm, title: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px',
                          outline: 'none',
                          transition: 'border-color 0.2s'
                        }}
                        placeholder="Enter report title..."
                        required
                        onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                        onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                      />
                    </div>

                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#374151',
                        marginBottom: '8px'
                      }}>
                        Description (Optional)
                      </label>
                      <input
                        type="text"
                        value={generatorForm.description}
                        onChange={(e) => setGeneratorForm({...generatorForm, description: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px',
                          outline: 'none',
                          transition: 'border-color 0.2s'
                        }}
                        placeholder="Brief description..."
                        onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                        onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                      />
                    </div>
                  </div>

                  {/* Date Range */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '24px'
                  }}>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#374151',
                        marginBottom: '8px'
                      }}>
                        From Date
                      </label>
                      <input
                        type="date"
                        value={generatorForm.parameters.dateFrom}
                        onChange={(e) => setGeneratorForm({
                          ...generatorForm,
                          parameters: {...generatorForm.parameters, dateFrom: e.target.value}
                        })}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px',
                          outline: 'none',
                          transition: 'border-color 0.2s'
                        }}
                        required
                        onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                        onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                      />
                    </div>

                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#374151',
                        marginBottom: '8px'
                      }}>
                        To Date
                      </label>
                      <input
                        type="date"
                        value={generatorForm.parameters.dateTo}
                        onChange={(e) => setGeneratorForm({
                          ...generatorForm,
                          parameters: {...generatorForm.parameters, dateTo: e.target.value}
                        })}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px',
                          outline: 'none',
                          transition: 'border-color 0.2s'
                        }}
                        required
                        onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                        onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                      />
                    </div>
                  </div>

                  {/* Filters */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '24px'
                  }}>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#374151',
                        marginBottom: '8px'
                      }}>
                        Department (Optional)
                      </label>
                      <select
                        value={generatorForm.parameters.departmentId}
                        onChange={(e) => setGeneratorForm({
                          ...generatorForm,
                          parameters: {...generatorForm.parameters, departmentId: e.target.value}
                        })}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px',
                          outline: 'none',
                          transition: 'border-color 0.2s'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                        onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                      >
                        <option value="">All Departments</option>
                        {departments.map(dept => (
                          <option key={dept.id} value={dept.id}>{dept.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#374151',
                        marginBottom: '8px'
                      }}>
                        Group By
                      </label>
                      <select
                        value={generatorForm.parameters.groupBy}
                        onChange={(e) => setGeneratorForm({
                          ...generatorForm,
                          parameters: {...generatorForm.parameters, groupBy: e.target.value}
                        })}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px',
                          outline: 'none',
                          transition: 'border-color 0.2s'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                        onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                      >
                        <option value="department">Department</option>
                        <option value="employee">Employee</option>
                        <option value="date">Date</option>
                        <option value="status">Status</option>
                      </select>
                    </div>
                  </div>

                  {/* Options */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={generatorForm.parameters.includeDetails}
                        onChange={(e) => setGeneratorForm({
                          ...generatorForm,
                          parameters: {...generatorForm.parameters, includeDetails: e.target.checked}
                        })}
                        style={{
                          height: '16px',
                          width: '16px',
                          marginRight: '8px',
                          accentColor: '#2563eb'
                        }}
                      />
                      <span style={{ fontSize: '14px', color: '#374151' }}>
                        Include detailed breakdown
                      </span>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    paddingTop: '16px',
                    borderTop: '1px solid #e5e7eb'
                  }}>
                    <button
                      onClick={handleGenerateReport}
                      disabled={loading}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 32px',
                        background: loading ? '#9ca3af' : '#2563eb',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '500',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        transition: 'background-color 0.2s',
                        opacity: loading ? 0.5 : 1
                      }}
                      onMouseOver={(e) => {
                        if (!loading) e.target.style.background = '#1d4ed8';
                      }}
                      onMouseOut={(e) => {
                        if (!loading) e.target.style.background = '#2563eb';
                      }}
                    >
                      {loading ? (
                        <>
                          <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} />
                          Generating Report...
                        </>
                      ) : (
                        <>
                          <Plus size={20} />
                          Generate Report
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Report History Tab */}
            {activeTab === 'history' && (
              <div style={{ padding: '24px' }}>
                {/* Filters */}
                <div style={{
                  marginBottom: '24px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '16px'
                }}>
                  <input
                    type="text"
                    placeholder="Search reports..."
                    value={filters.search}
                    onChange={(e) => setFilters({...filters, search: e.target.value})}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  />
                  
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters({...filters, type: e.target.value})}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  >
                    <option value="all">All Types</option>
                    {reportTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>

                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  >
                    <option value="all">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="generating">Generating</option>
                    <option value="failed">Failed</option>
                  </select>

                  <button
                    onClick={fetchReports}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '8px 16px',
                      background: '#f3f4f6',
                      color: '#374151',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.background = '#e5e7eb'}
                    onMouseOut={(e) => e.target.style.background = '#f3f4f6'}
                  >
                    <RefreshCw size={16} />
                    Refresh
                  </button>
                </div>

                {/* Reports Table */}
                <div style={{
                  overflow: 'hidden',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#f9fafb' }}>
                      <tr>
                        <th style={{
                          padding: '12px 24px',
                          textAlign: 'left',
                          fontSize: '12px',
                          fontWeight: '500',
                          color: '#6b7280',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          Report
                        </th>
                        <th style={{
                          padding: '12px 24px',
                          textAlign: 'left',
                          fontSize: '12px',
                          fontWeight: '500',
                          color: '#6b7280',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          Type
                        </th>
                        <th style={{
                          padding: '12px 24px',
                          textAlign: 'left',
                          fontSize: '12px',
                          fontWeight: '500',
                          color: '#6b7280',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          Status
                        </th>
                        <th style={{
                          padding: '12px 24px',
                          textAlign: 'left',
                          fontSize: '12px',
                          fontWeight: '500',
                          color: '#6b7280',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          Created
                        </th>
                        <th style={{
                          padding: '12px 24px',
                          textAlign: 'left',
                          fontSize: '12px',
                          fontWeight: '500',
                          color: '#6b7280',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          Size
                        </th>
                        <th style={{
                          padding: '12px 24px',
                          textAlign: 'left',
                          fontSize: '12px',
                          fontWeight: '500',
                          color: '#6b7280',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody style={{ background: 'white' }}>
                      {filteredReports.length > 0 ? (
                        filteredReports.map((report, index) => (
                          <tr 
                            key={report.id}
                            style={{
                              borderTop: index > 0 ? '1px solid #e5e7eb' : 'none'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = '#f9fafb'}
                            onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                          >
                            <td style={{ padding: '16px 24px' }}>
                              <div>
                                <div style={{
                                  fontWeight: '500',
                                  color: '#111827',
                                  margin: '0 0 4px 0'
                                }}>
                                  {report.title}
                                </div>
                                <div style={{
                                  fontSize: '14px',
                                  color: '#6b7280',
                                  margin: 0
                                }}>
                                  {report.description}
                                </div>
                              </div>
                            </td>
                            <td style={{
                              padding: '16px 24px',
                              fontSize: '14px',
                              color: '#111827'
                            }}>
                              {report.reportType}
                            </td>
                            <td style={{ padding: '16px 24px' }}>
                              {getStatusBadge(report.status)}
                            </td>
                            <td style={{
                              padding: '16px 24px',
                              fontSize: '14px',
                              color: '#6b7280'
                            }}>
                              {new Date(report.createdAt).toLocaleDateString()}
                            </td>
                            <td style={{
                              padding: '16px 24px',
                              fontSize: '14px',
                              color: '#6b7280'
                            }}>
                              {report.fileSize || 'N/A'}
                            </td>
                            <td style={{ padding: '16px 24px' }}>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                {report.status === 'COMPLETED' && (
                                  <button
                                    onClick={() => handleDownload(report.id)}
                                    style={{
                                      padding: '4px',
                                      background: 'none',
                                      border: 'none',
                                      cursor: 'pointer',
                                      color: '#6b7280',
                                      transition: 'color 0.2s'
                                    }}
                                    title="Download"
                                    onMouseOver={(e) => e.target.style.color = '#2563eb'}
                                    onMouseOut={(e) => e.target.style.color = '#6b7280'}
                                  >
                                    <Download size={16} />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDelete(report.id)}
                                  style={{
                                    padding: '4px',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: '#6b7280',
                                    transition: 'color 0.2s'
                                  }}
                                  title="Delete"
                                  onMouseOver={(e) => e.target.style.color = '#dc2626'}
                                  onMouseOut={(e) => e.target.style.color = '#6b7280'}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" style={{
                            padding: '48px 24px',
                            textAlign: 'center',
                            color: '#6b7280'
                          }}>
                            <FileText size={48} style={{
                              width: '48px',
                              height: '48px',
                              color: '#d1d5db',
                              margin: '0 auto 16px'
                            }} />
                            <p>No reports found.</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Reporting;
