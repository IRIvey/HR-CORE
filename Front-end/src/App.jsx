import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './components/sidebar';
import EmployeeListPage from './components/EmployeeListPage';
import Profile from './components/ViewEmployee';
import EmployeeGoals from './components/EmployeeGoals';
import PerformanceReview from './components/PerformanceReview';
import LeaveRequests from './components/LeaveRequests';
import CandidatesPage from './CandidatesPage';
import JobPostingsPage from './JobPostingsPage';
import Salary from './components/Salary';
import AdminProfile from './components/AdminProfile';
import ViewEmployee from './components/ViewEmployee';
import LoginForm from './components/LoginForm';
import LandingPage from './components/LandingPage';
import AttendanceLogs from './components/AttendanceLogs';
import AboutPage from './components/AboutPage';
import ContactPage from './components/ContactPage';
import Reporting from './components/Reporting';
import SystemSettings from './components/SystemSettings';
import './RecruitmentDashboard.css';
import OvertimePay from './components/OvertimePay';

const LayoutWithSidebar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:5000/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (err) {
      console.error('Logout failed:', err);
    }
    navigate('/');
  };

  return (
    <div className="app-layout">
      <Sidebar onLogout={handleLogout} />

      <div className="main-dashboard">
        <div className="top-navigation">
          <div className="nav-links">
            <button className="nav-link logout-btn" onClick={() => navigate('/')}>
              Home
            </button>
            <Link to="/about" className="nav-link">About</Link>
            <Link to="/contact" className="nav-link">Contacts</Link>
            <button className="nav-link logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>

        <Routes>
          <Route path="/EmployeeList" element={<EmployeeListPage />} />
          <Route path="/employee/:id" element={<ViewEmployee />} />
          <Route path="/AdminProfile" element={<AdminProfile />} />
          <Route path="/EmployeeGoals" element={<EmployeeGoals />} />
          <Route path="/Candidates" element={<CandidatesPage />} />
          <Route path="/JobPostings" element={<JobPostingsPage />} />
          <Route path="/leave-requests" element={<LeaveRequests />} />
          <Route path="/dashboard" element={<Reporting />} />
          <Route path="/attendance" element={<AttendanceLogs />} />
          <Route path="/PerformanceReview" element={<PerformanceReview />} />
          <Route path="/Salary" element={<Salary />} />
          <Route path="/overtime" element={<OvertimePay />} />
          <Route path="/settings" element={<SystemSettings />} />
          <Route path="*" element={<h2>Page Not Found</h2>} />
        </Routes>
      </div>
    </div>
  );
};

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [checkingAuth, setCheckingAuth] = useState(true);

 

  useEffect(() => {
  const checkAuth = async () => {
    try {
      const res = await fetch('http://localhost:5000/auth/status', {
        credentials: 'include',
      });
      const data = await res.json();

      if (!data.loggedIn) {
        // Only redirect if user is not on a public page
        const publicPaths = ['/', '/login', '/about', '/contact'];
        if (!publicPaths.includes(location.pathname)) {
          navigate('/login');
        }
      }
      // If logged in, do nothing – stay on the page user clicked
    } catch (err) {
      console.error('Auth check failed:', err);
      const publicPaths = ['/', '/login', '/about', '/contact'];
      if (!publicPaths.includes(location.pathname)) {
        navigate('/login');
      }
    } finally {
      setCheckingAuth(false);
    }
  };

  checkAuth();
}, [location.pathname, navigate]);


  if (checkingAuth) return <div>Loading...</div>;

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginForm />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/home" element={<LandingPage />} />
      <Route path="*" element={<LayoutWithSidebar />} />
    </Routes>
  );
}

export default function AppWrapper() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}

