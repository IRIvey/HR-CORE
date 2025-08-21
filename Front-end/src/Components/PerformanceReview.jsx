
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Star, MessageCircle, Calendar, PlusCircle, Search, Filter,
  Download, Upload, BarChart3, TrendingUp, Eye, Edit, Trash2,
  CheckSquare, Square, MoreHorizontal, Loader
} from 'lucide-react';
import './PerformanceReview.css';

const PerformanceReview = () => {
  const [reviews, setReviews] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingReview, setEditingReview] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalCount: 0,
    hasNext: false,
    hasPrev: false
  });

  // Role-based state - Following exact pattern from EmployeeGoals
  const [role, setRole] = useState(null);     // 'ADMIN' | 'TEAM_LEAD' | 'EMPLOYEE' | null
  const [authChecked, setAuthChecked] = useState(false);

  const [reviewData, setReviewData] = useState({
    employeeId: '', rating: 0, feedback: '',
    reviewDate: new Date().toISOString().split('T')[0],
    reviewPeriod: '', goals: ''
  });

  const [filter, setFilter] = useState({
    search: '', department: '', month: '', rating: '', reviewPeriod: '',
    dateRange: { start: '', end: '' }
  });

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedReviews, setSelectedReviews] = useState(new Set());
  const [viewMode, setViewMode] = useState('card'); // 'card' | 'table'
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('reviewDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  // API Base URL
  const API_BASE = 'http://localhost:5000/api';

  // Auth check effect (first priority) - Following exact pattern from EmployeeGoals
  useEffect(() => {
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

  // Fetch reviews from API - Updated to check auth first
  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        sortBy,
        sortOrder,
        ...(filter.search && { search: filter.search }),
        ...(filter.department && { department: filter.department }),
        ...(filter.rating && { rating: filter.rating }),
        ...(filter.reviewPeriod && { reviewPeriod: filter.reviewPeriod }),
        ...(filter.dateRange.start && { startDate: filter.dateRange.start }),
        ...(filter.dateRange.end && { endDate: filter.dateRange.end }),
      });

      const response = await fetch(`${API_BASE}/reviews?${params}`, {
        method: "GET",
        credentials: "include",
      });

      if (response.status === 401) return navigate('/login');
      if (response.status === 403) return alert('Forbidden');
      if (!response.ok) throw new Error("Failed to fetch reviews");

      const data = await response.json();
      setReviews(data.reviews);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch employees for dropdown - Updated to check auth first
  const fetchEmployees = async () => {
    try {
      const response = await fetch(`${API_BASE}/employees`, {
        method: "GET",
        credentials: "include",
      });

      if (response.status === 401) return navigate('/login');
      if (response.status === 403) return alert('Forbidden');
      if (!response.ok) throw new Error("Failed to fetch employees");

      const data = await response.json();
      setEmployees(data.employees || data);
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };

  // Fetch analytics data - Updated to check auth first
  const fetchAnalytics = async () => {
    try {
      const params = new URLSearchParams({
        ...(filter.department && { department: filter.department }),
        ...(filter.dateRange.start && { startDate: filter.dateRange.start }),
        ...(filter.dateRange.end && { endDate: filter.dateRange.end })
      });

      const response = await fetch(`${API_BASE}/reviews/analytics?${params}`, {
        credentials: 'include'
      });
      
      if (response.status === 401) return navigate('/login');
      if (response.status === 403) return alert('Forbidden');
      if (!response.ok) throw new Error('Failed to fetch analytics');
      
      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    }
  };

  // Fetch data only after auth is checked - Following exact pattern from EmployeeGoals
  useEffect(() => {
    if (authChecked) {
      fetchReviews();
      fetchEmployees();
    }
  }, [authChecked, currentPage, sortBy, sortOrder, filter]);

  // Fetch analytics when analytics panel is shown - Only after auth check
  useEffect(() => {
    if (authChecked && showAnalytics) {
      fetchAnalytics();
    }
  }, [authChecked, showAnalytics, filter.department, filter.dateRange]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setReviewData(prev => ({ ...prev, [name]: value }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const handleDateRangeChange = (field, value) => {
    setFilter(prev => ({ ...prev, dateRange: { ...prev.dateRange, [field]: value } }));
    setCurrentPage(1);
  };

  const handleSelectAll = () => {
    if (selectedReviews.size === reviews.length) {
      setSelectedReviews(new Set());
    } else {
      setSelectedReviews(new Set(reviews.map(r => r.id)));
    }
  };

  const handleSelectReview = (id) => {
    const next = new Set(selectedReviews);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedReviews(next);
  };

  const handleBulkDelete = async () => {
    if (selectedReviews.size > 0) {
      const ok = window.confirm(`Delete ${selectedReviews.size} selected reviews?`);
      if (ok) {
        try {
          const response = await fetch(`${API_BASE}/reviews/bulk-delete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids: Array.from(selectedReviews) }),
            credentials: 'include'
          });

          if (response.status === 401) return navigate('/login');
          if (response.status === 403) return alert('Forbidden');
          if (!response.ok) throw new Error('Failed to delete reviews');
          
          setSelectedReviews(new Set());
          fetchReviews();
          alert(`${selectedReviews.size} reviews deleted successfully`);
        } catch (err) {
          alert('Error deleting reviews: ' + err.message);
        }
      }
    }
  };

  const handleBulkExport = async () => {
    if (selectedReviews.size > 0) {
      try {
        const ids = Array.from(selectedReviews).join(',');
        const response = await fetch(`${API_BASE}/reviews/export?ids=${ids}`, {
          credentials: 'include'
        });
        
        if (response.status === 401) return navigate('/login');
        if (response.status === 403) return alert('Forbidden');
        if (!response.ok) throw new Error('Failed to export reviews');
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'performance_reviews.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        alert(`${selectedReviews.size} reviews exported to CSV`);
      } catch (err) {
        alert('Error exporting reviews: ' + err.message);
      }
    }
  };

  const handleAddReview = async () => {
    const { employeeId, rating, feedback, reviewDate, reviewPeriod, goals } = reviewData;
    
    if (!employeeId || !rating || !feedback || !reviewDate || !reviewPeriod) {
      alert('Please fill in all required fields!');
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(`${API_BASE}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: parseInt(employeeId),
          rating: parseFloat(rating),
          feedback,
          reviewDate,
          reviewPeriod,
          goals: goals || 'No specific goals set'
        }),
        credentials: 'include'
      });

      if (response.status === 401) return navigate('/login');
      if (response.status === 403) return alert('Forbidden');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create review');
      }

      setReviewData({
        employeeId: '', rating: 0, feedback: '',
        reviewDate: new Date().toISOString().split('T')[0],
        reviewPeriod: '', goals: ''
      });
      setShowReviewForm(false);
      fetchReviews();
      alert('Review created successfully!');
    } catch (err) {
      alert('Error creating review: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    const ok = window.confirm('Are you sure you want to delete this review?');
    if (ok) {
      try {
        const response = await fetch(`${API_BASE}/reviews/${reviewId}`, {
          method: 'DELETE',
          credentials: 'include'
        });

        if (response.status === 401) return navigate('/login');
        if (response.status === 403) return alert('Forbidden');
        if (!response.ok) throw new Error('Failed to delete review');
        
        fetchReviews();
        alert('Review deleted successfully');
      } catch (err) {
        alert('Error deleting review: ' + err.message);
      }
    }
  };

  const handleEditReview = async (id, updatedFields) => {
    try {
      const res = await fetch(`${API_BASE}/reviews/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields),
        credentials: 'include'
      });

      if (res.status === 401) return navigate('/login');
      if (res.status === 403) return alert('Forbidden');
      if (!res.ok) throw new Error('Failed to update review');
      
      const data = await res.json();
      setReviews(prev =>
        prev.map(r => (r.id === id ? data.review : r))
      );
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  const clearFilters = () => {
    setFilter({
      search: '', department: '', month: '', rating: '',
      reviewPeriod: '', dateRange: { start: '', end: '' }
    });
  };

  const renderStars = (rating) => {
    const stars = [];
    const full = Math.floor(rating);
    const half = rating % 1 !== 0;
    for (let i = 0; i < 5; i++) {
      if (i < full) stars.push(<span key={i} className="star star-on">★</span>);
      else if (i === full && half) stars.push(<span key={i} className="star star-on">★</span>);
      else stars.push(<span key={i} className="star star-off">★</span>);
    }
    return stars;
  };

  // Guard while we check auth state - Following exact pattern from EmployeeGoals
  if (!authChecked) return null;

  // Role-based permissions - Following exact pattern from EmployeeGoals
  const isAdmin = role === 'ADMIN';
  const isTeamLead = role === 'TEAM_LEAD';
  const canManageReviews = isAdmin || isTeamLead; // ADMIN and TEAM_LEAD can manage
  // EMPLOYEE can only view and search (no add, no bulk actions, no edit/delete)

  if (loading && reviews.length === 0) {
    return (
      <div className="pr-app">
        <div className="pr-container">
          <div className="loading-container">
            <Loader size={48} className="spinner" />
            <p>Loading performance reviews...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && reviews.length === 0) {
    return (
      <div className="pr-app">
        <div className="pr-container">
          <div className="error-container">
            <p>Error loading reviews: {error}</p>
            <button onClick={() => fetchReviews()} className="btn btn-primary">
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="pr-app">
      <div className="pr-container">

        {/* Header */}
        <div className="pr-card pr-header-card">
          <div className="pr-header">
            <div>
              <h2 className="pr-title">Performance Reviews</h2>
              <p className="pr-subtitle">Manage and track employee performance evaluations</p>
            </div>
            <div className="pr-header-actions">
              {canManageReviews && (
              <button onClick={() => setShowAnalytics(!showAnalytics)} className="btn btn-analytics">
                <BarChart3 size={18} />
                <span>Analytics</span>
              </button>
)}
     {canManageReviews && (
              <button onClick={() => setShowReviewForm(true)} className="btn btn-primary">
                <PlusCircle size={18} />
                <span>Add Review</span>
              </button>
     )}
            </div>
            
          </div>
        </div>

        {/* Analytics */}
        {showAnalytics && analytics && (
          <div className="pr-card">
            <h3 className="section-title">
              <TrendingUp size={20} />
              <span>Performance Analytics</span>
            </h3>

            <div className="grid grid-4 gap">
              <div className="stat stat-blue">
                <h4>Total Reviews</h4>
                <p className="stat-number">{analytics.totalReviews}</p>
              </div>
              <div className="stat stat-green">
                <h4>Average Rating</h4>
                <p className="stat-number">{analytics.averageRating}</p>
              </div>
              <div className="stat stat-purple">
                <h4>Departments</h4>
                <p className="stat-number">{analytics.departmentCount}</p>
              </div>
              <div className="stat stat-orange">
                <h4>High Performers</h4>
                <p className="stat-number">{analytics.highPerformers}</p>
              </div>
            </div>

            <div className="grid grid-2 gap mt">
              <div>
                <h4 className="subsection-title">Department Performance</h4>
                {Object.entries(analytics.departmentStats || {}).map(([dept, stats]) => (
                  <div key={dept} className="row-tile">
                    <span>{dept}</span>
                    <div className="row-right">
                      <span className="muted">({stats.count} reviews)</span>
                      <span className="strong">{stats.avgRating}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <h4 className="subsection-title">Rating Distribution</h4>
                {[5,4,3,2,1].map(r => (
                  <div key={r} className="row-tile">
                    <span className="row-left">
                      {r} <span className="star star-on">★</span>
                    </span>
                    <span className="strong">{analytics.ratingDistribution?.[r] || 0}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Add Review Form */}
        {showReviewForm && (
          <div className="pr-card">
            <h3 className="section-title">Add New Performance Review</h3>
            <div className="grid grid-2 gap">
              <div className="form-group">
                <label>Employee</label>
                <select name="employeeId" value={reviewData.employeeId} onChange={handleInputChange} className="input">
                  <option value="">Select Employee</option>
                  {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Rating (0-5)</label>
                <input type="number" name="rating" value={reviewData.rating} onChange={handleInputChange}
                       min="0" max="5" step="0.1" className="input" />
              </div>
              <div className="form-group">
                <label>Review Date</label>
                <input type="date" name="reviewDate" value={reviewData.reviewDate}
                       onChange={handleInputChange} className="input" />
              </div>
              <div className="form-group">
                <label>Review Period</label>
                <select name="reviewPeriod" value={reviewData.reviewPeriod} onChange={handleInputChange} className="input">
                  <option value="">Select Period</option>
                  <option value="Q1 2025">Q1 2025</option>
                  <option value="Q2 2025">Q2 2025</option>
                  <option value="Q3 2025">Q3 2025</option>
                  <option value="Q4 2025">Q4 2025</option>
                </select>
              </div>
              <div className="form-group span-2">
                <label>Feedback</label>
                <textarea name="feedback" rows="3" value={reviewData.feedback} onChange={handleInputChange} className="textarea" />
              </div>
              <div className="form-group span-2">
                <label>Goals & Objectives</label>
                <textarea name="goals" rows="2" value={reviewData.goals} onChange={handleInputChange} className="textarea" />
              </div>
            </div>

            <div className="row actions">
                 {canManageReviews && (
              <button 
                onClick={handleAddReview} 
                disabled={submitting}
                className="btn btn-primary"
              >
                {submitting ? <Loader size={16} className="spinner" /> : 'Submit Review'}
              </button>
                 )}
              <button onClick={() => setShowReviewForm(false)} className="btn btn-muted">Cancel</button>
              
            </div>
          </div>
        )}

        {/* Search & Filters */}
        <div className="pr-card">
          <div className="toolbar">
            <div className="search-wrap">
              <Search size={18} className="search-icon" />
           <input 
  type="text"
  name="search"
  value={filter.search}
  onChange={handleFilterChange}
  placeholder="Search by employee name, ID, or feedback..."
  className="input search-input"
/>
            </div>

            <button onClick={() => setShowFilters(!showFilters)} className="btn btn-light">
              <Filter size={18} /><span>Filters</span>
            </button>

            <div className="toggle-group">
              <button onClick={() => setViewMode('card')} className={`toggle ${viewMode==='card' ? 'active' : ''}`} title="Card view">
                <Square size={18} />
              </button>
              <button onClick={() => setViewMode('table')} className={`toggle ${viewMode==='table' ? 'active' : ''}`} title="Table view">
                <MoreHorizontal size={18} />
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="pr-filters">
              <div className="form-group">
                <label>Department</label>
                <select name="department" value={filter.department} onChange={handleFilterChange} className="input">
                  <option value="">All Departments</option>
                  <option value="Design">Design</option>
                  <option value="Engineering">Engineering</option>
                </select>
              </div>
              <div className="form-group">
                <label>Rating</label>
                <select name="rating" value={filter.rating} onChange={handleFilterChange} className="input">
                  <option value="">All Ratings</option>
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </select>
              </div>
              <div className="form-group">
                <label>Period</label>
                <select name="reviewPeriod" value={filter.reviewPeriod} onChange={handleFilterChange} className="input">
                  <option value="">All Periods</option>
                  <option value="Q1 2025">Q1 2025</option>
                  <option value="Q2 2025">Q2 2025</option>
                  <option value="Q3 2025">Q3 2025</option>
                  <option value="Q4 2025">Q4 2025</option>
                </select>
              </div>
              <div className="form-group">
                <label>From Date</label>
                <input type="date" value={filter.dateRange.start}
                       onChange={(e) => handleDateRangeChange('start', e.target.value)} className="input" />
              </div>
              <div className="form-group">
                <label>To Date</label>
                <input type="date" value={filter.dateRange.end}
                       onChange={(e) => handleDateRangeChange('end', e.target.value)} className="input" />
              </div>
              <div className="form-group align-end">
                <button onClick={clearFilters} className="btn btn-muted w-100">Clear All</button>
              </div>
            </div>
          )}

          {selectedReviews.size > 0 && (
            <div className="bulk-bar">
              <span className="muted">{selectedReviews.size} selected</span>
              <div className="row gap-sm">
                <button onClick={handleBulkExport} className="btn btn-success btn-sm">
                  <Download size={14} /> <span>Export</span>
                </button>
                <button onClick={handleBulkDelete} className="btn btn-danger btn-sm">
                  <Trash2 size={14} /> <span>Delete</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Reviews */}
        <div className="pr-card">
          <div className="list-head">
            <h3 className="section-title tight">Reviews ({pagination.totalCount})</h3>
            <div className="row gap-sm">
              <select value={sortBy} onChange={(e)=>setSortBy(e.target.value)} className="input input-sm">
                <option value="reviewDate">Sort by Date</option>
                <option value="rating">Sort by Rating</option>
                <option value="employee.name">Sort by Name</option>
                <option value="department">Sort by Department</option>
              </select>
              <button onClick={()=>setSortOrder(sortOrder==='asc'?'desc':'asc')} className="btn btn-light">
                {sortOrder==='asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>

          {viewMode === 'card' ? (
            <div className="review-grid">
              {reviews.map((review) => (
                <div key={review.id} className="review-card">
                  <div className="review-top">
                    <div className="row gap">
                      <button
                        onClick={() => handleSelectReview(review.id)}
                        className={`check ${selectedReviews.has(review.id) ? 'active' : ''}`}
                        title="Select"
                      >
                        {selectedReviews.has(review.id) ? <CheckSquare size={20} /> : <Square size={20} />}
                      </button>
                      <div>
                        <h4 className="review-name">
                          <User size={18} /> {review.employee.name}
                        </h4>
                        <p className="muted">{review.employee.department.name}</p>
                      </div>
                    </div>
                    <div className="row gap-sm">
                      <button className="icon-btn" title="View"><Eye size={16} /></button>
<button
  className="icon-btn"
  title="Edit"
  onClick={() => {
    const newRating = parseFloat(prompt("Enter new rating (0-5):", review.rating));
    const newFeedback = prompt("Enter new feedback:", review.feedback);

    if (isNaN(newRating) || newRating < 0 || newRating > 5) {
      return alert("Invalid rating");
    }

    handleEditReview(review.id, { rating: newRating, feedback: newFeedback });
  }}
>
  <Edit size={16} />
</button>


                      <button 
                        onClick={() => handleDeleteReview(review.id)}
                        className="icon-btn danger" 
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="review-body">
                    <div className="row gap-sm">
                      <Star size={18} />
                      <span className="strong">Rating: {review.rating}</span>
                      <div className="stars">{renderStars(review.rating)}</div>
                    </div>

                    <div className="row gap-sm muted">
                      <Calendar size={16} />
                      <span>{new Date(review.reviewDate).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{review.reviewPeriod}</span>
                    </div>

                    <div className="block">
                      <div className="row gap-sm">
                        <MessageCircle size={16} />
                        <span className="strong tiny">Feedback:</span>
                      </div>
                      <p className="text">{review.feedback}</p>
                    </div>

                    <div className="divider" />
                    <span className="strong tiny">Goals:</span>
                    <p className="text">{review.goals}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="table-wrap">
              <table className="pr-table">
                <thead>
                <tr>
                  <th>
                    <button onClick={handleSelectAll} className="icon-btn">
                      {(selectedReviews.size === reviews.length && reviews.length>0)
                        ? <CheckSquare size={20} /> : <Square size={20} />}
                    </button>
                  </th>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Rating</th>
                  <th>Period</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {reviews.map(review => (
                  <tr key={review.id}>
                    <td>
                      <button onClick={() => handleSelectReview(review.id)} className="icon-btn">
                        {selectedReviews.has(review.id) ? <CheckSquare size={20} /> : <Square size={20} />}
                      </button>
                    </td>
                    <td className="strong">{review.employee.name}</td>
                    <td>{review.employee.department.name}</td>
                    <td>
                      <div className="row gap-sm">
                        <span className="strong">{review.rating}</span>
                        <div className="stars">{renderStars(review.rating)}</div>
                      </div>
                    </td>
                    <td>{review.reviewPeriod}</td>
                    <td>{new Date(review.reviewDate).toLocaleDateString()}</td>
                    <td>
                      <div className="row gap-sm">
                        <button className="icon-btn" title="View"><Eye size={16} /></button>
                        <button className="icon-btn" title="Edit"><Edit size={16} /></button>
                        <button 
                          onClick={() => handleDeleteReview(review.id)}
                          className="icon-btn danger" 
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="pagination">
              <div className="muted">
                Showing {((currentPage-1)*itemsPerPage)+1} to {Math.min(currentPage*itemsPerPage, pagination.totalCount)} of {pagination.totalCount} results
              </div>
              <div className="row gap-sm">
                <button 
                  onClick={()=>setCurrentPage(currentPage-1)} 
                  disabled={!pagination.hasPrev} 
                  className="btn btn-light"
                >
                  Previous
                </button>
                {Array.from({length: pagination.totalPages}, (_,i)=>i+1).map(p=>(
                  <button key={p} onClick={()=>setCurrentPage(p)}
                          className={`btn page ${currentPage===p ? 'active' : ''}`}>{p}</button>
                ))}
                <button 
                  onClick={()=>setCurrentPage(currentPage+1)} 
                  disabled={!pagination.hasNext} 
                  className="btn btn-light"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {reviews.length === 0 && !loading && (
            <div className="empty">
              <Search size={48} />
              <h3>No reviews found</h3>
              <p className="muted">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>

        {/* Trends */}
        {analytics && analytics.employeeTrends && (
          <div className="pr-card">
            <h3 className="section-title">
              <TrendingUp size={20} />
              <span>Performance Trends Over Time</span>
            </h3>
            <div className="grid grid-3 gap">
              {Object.entries(analytics.employeeTrends).map(([name, history]) => (
                <div key={name} className="trend-card">
                  <h4 className="strong">{name}</h4>
                  <div className="trend-list">
                    {history.map((rev, i) => (
                      <div key={i} className="row space-between tiny">
                        <span className="muted">{rev.period}</span>
                        <div className="row gap-xs">
                          <span className="strong">{rev.rating}</span>
                          {i>0 && (
                            <span className={`delta ${rev.rating >= history[i-1].rating ? 'up' : 'down'}`}>
                              {rev.rating >= history[i-1].rating ? '↗' : '↘'}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="divider" />
                  <div className="row space-between tiny">
                    <span className="muted">Average</span>
                    <span className="strong">
                      {(history.reduce((s,r)=>s+r.rating,0)/history.length).toFixed(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Stats */}
        {analytics && (
          <div className="quick-grid">
            <div className="quick stat-border red">
              <div className="big">{analytics.performanceCategories?.needsImprovement || 0}</div>
              <div className="muted">Needs Improvement (&lt;3.0)</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceReview; 
